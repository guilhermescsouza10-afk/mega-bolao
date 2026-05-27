import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { calculateScore } from "./scoring";
import { syncMatchResults } from "./footballApi";
import { populateRound32, propagateKnockoutWinner } from "./bracket";
import { calculateAllGroupStandings } from "./standings";

admin.initializeApp();
const db = admin.firestore();

// ═══════════════════════════════════════════════════════
// 1. calcularPontuacaoJogo
//    Calculates scores for all predictions of a match
//    across all groups. Can be called manually by admin
//    or triggered automatically after API sync.
// ═══════════════════════════════════════════════════════
async function processMatchScoring(jogoId: string, golsMandante: number, golsVisitante: number) {
  const gruposSnap = await db.collection("grupos").get();
  let totalUpdated = 0;

  for (const grupoDoc of gruposSnap.docs) {
    const grupoId = grupoDoc.id;

    const votosSnap = await db
      .collection(`grupos/${grupoId}/palpites/${jogoId}/votos`)
      .get();

    if (votosSnap.empty) continue;

    const batch = db.batch();

    for (const votoDoc of votosSnap.docs) {
      const userId = votoDoc.id;
      const voto = votoDoc.data();

      const result = calculateScore(
        voto.golsMandante,
        voto.golsVisitante,
        golsMandante,
        golsVisitante
      );

      batch.update(votoDoc.ref, {
        pontos: result.points,
        tipoPontuacao: result.key,
      });

      const membroRef = db.doc(`grupos/${grupoId}/membros/${userId}`);
      batch.update(membroRef, {
        totalPontos: admin.firestore.FieldValue.increment(result.points),
        pontosJogos: admin.firestore.FieldValue.increment(result.points),
        palpitesCertos: result.points > 0
          ? admin.firestore.FieldValue.increment(1)
          : admin.firestore.FieldValue.increment(0),
      });

      totalUpdated++;
    }

    await batch.commit();
  }

  return totalUpdated;
}

// Manual scoring by admin (fallback)
export const calcularPontuacaoJogo = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login necessário");
  }

  const { jogoId, golsMandante, golsVisitante } = request.data;

  if (!jogoId || golsMandante == null || golsVisitante == null) {
    throw new HttpsError("invalid-argument", "Dados incompletos");
  }

  await db.doc(`jogos/${jogoId}`).set(
    {
      golsMandante,
      golsVisitante,
      status: "ENCERRADO",
      atualizadoPor: request.auth.uid,
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const totalUpdated = await processMatchScoring(jogoId, golsMandante, golsVisitante);

  // Propagate knockout bracket
  await propagateKnockoutWinner(jogoId);

  return { success: true, totalUpdated };
});

// ═══════════════════════════════════════════════════════
// 2. sincronizarResultados (NEW)
//    Scheduled function — runs every 5 minutes during
//    match days. Fetches results from football-data.org,
//    calculates scores, and propagates bracket.
// ═══════════════════════════════════════════════════════
export const sincronizarResultados = onSchedule(
  { schedule: "every 5 minutes", timeZone: "America/Sao_Paulo" },
  async () => {
    console.log("🔄 Syncing match results from football-data.org...");

    try {
      const syncResult = await syncMatchResults();

      console.log(
        `Sync complete: ${syncResult.synced} new, ${syncResult.skipped} skipped, ${syncResult.errors.length} errors`
      );

      if (syncResult.errors.length > 0) {
        console.warn("Sync errors:", syncResult.errors);
      }

      // For each newly synced result, calculate scores and propagate bracket
      for (const matchId of syncResult.newResults) {
        const matchSnap = await db.doc(`jogos/${matchId}`).get();
        const matchData = matchSnap.data();

        if (matchData?.golsMandante != null && matchData?.golsVisitante != null) {
          // Calculate prediction scores
          const updated = await processMatchScoring(
            matchId,
            matchData.golsMandante,
            matchData.golsVisitante
          );
          console.log(`Scored ${updated} predictions for match ${matchId}`);

          // Propagate knockout winner to next round
          const propagation = await propagateKnockoutWinner(matchId);
          if (propagation.updated) {
            console.log(`Propagated winner to ${propagation.updated}`);
          }
        }
      }

      // Check if all group stage matches are done → populate Round of 32
      await checkAndPopulateRound32();

    } catch (err) {
      console.error("Sync failed:", err);
    }
  }
);

/**
 * Check if all 72 group stage matches are finished.
 * If so, automatically populate the Round of 32 bracket.
 */
async function checkAndPopulateRound32() {
  // Check if R32 already has teams assigned
  const r32Snap = await db.doc("jogos/R32_1").get();
  const r32Data = r32Snap.data();
  if (r32Data?.mandante) return; // Already populated

  // Count finished group matches
  const finishedSnap = await db.collection("jogos")
    .where("fase", "==", "GROUP")
    .where("status", "==", "ENCERRADO")
    .get();

  if (finishedSnap.size < 72) return; // Not all done yet

  console.log("🏆 All group matches finished! Populating Round of 32...");
  const result = await populateRound32();
  console.log(`R32 populated: ${result.updated} matches updated, ${result.errors.length} errors`);

  if (result.errors.length > 0) {
    console.warn("R32 population errors:", result.errors);
  }
}

// ═══════════════════════════════════════════════════════
// 3. classificacaoGrupos (NEW)
//    Callable function to get current group standings.
//    Used by frontend to display standings table.
// ═══════════════════════════════════════════════════════
export const classificacaoGrupos = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login necessário");
  }

  const allStandings = await calculateAllGroupStandings();
  return { standings: allStandings };
});

// ═══════════════════════════════════════════════════════
// 4. forcarPopulacaoR32 (NEW)
//    Admin-only callable to manually trigger R32 population.
// ═══════════════════════════════════════════════════════
export const forcarPopulacaoR32 = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login necessário");
  }

  const result = await populateRound32();
  return result;
});

// ═══════════════════════════════════════════════════════
// 5. calcularPontuacaoBonus
//    Called at end of tournament to score bonus questions.
// ═══════════════════════════════════════════════════════
export const calcularPontuacaoBonus = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login necessário");
  }

  const { campeao, viceCampeao, artilheiro } = request.data;

  if (!campeao || !viceCampeao || !artilheiro) {
    throw new HttpsError("invalid-argument", "Dados incompletos");
  }

  const gruposSnap = await db.collection("grupos").get();

  for (const grupoDoc of gruposSnap.docs) {
    const grupoId = grupoDoc.id;
    const bonusSnap = await db
      .collection(`grupos/${grupoId}/bonus`)
      .get();

    const batch = db.batch();

    for (const bonusDoc of bonusSnap.docs) {
      const userId = bonusDoc.id;
      const data = bonusDoc.data();

      let pontosCampeao = 0;
      let pontosVice = 0;
      let pontosArtilheiro = 0;

      if (data.campeao === campeao) pontosCampeao = 50;
      if (data.viceCampeao === viceCampeao) pontosVice = 30;
      if (
        data.artilheiro &&
        data.artilheiro.toLowerCase().trim() ===
          artilheiro.toLowerCase().trim()
      ) {
        pontosArtilheiro = 20;
      }

      const totalBonus = pontosCampeao + pontosVice + pontosArtilheiro;

      batch.update(bonusDoc.ref, {
        pontosCampeao,
        pontosVice,
        pontosArtilheiro,
      });

      const membroRef = db.doc(`grupos/${grupoId}/membros/${userId}`);
      batch.update(membroRef, {
        pontosBonus: totalBonus,
        totalPontos: admin.firestore.FieldValue.increment(totalBonus),
      });
    }

    await batch.commit();
  }

  return { success: true };
});

// ═══════════════════════════════════════════════════════
// 6. bloquearPalpites
//    Scheduled function — runs every 15 minutes.
//    Locks predictions 1h before each match.
// ═══════════════════════════════════════════════════════
export const bloquearPalpites = onSchedule("every 15 minutes", async () => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const jogosSnap = await db
    .collection("jogos")
    .where("status", "==", "ABERTO")
    .get();

  const batch = db.batch();
  let count = 0;

  for (const jogoDoc of jogosSnap.docs) {
    const data = jogoDoc.data();
    const matchTime = data.dataHora?.toDate?.() || new Date(data.dataHora);

    if (matchTime <= oneHourFromNow) {
      batch.update(jogoDoc.ref, { status: "FECHADO" });
      count++;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Locked ${count} matches`);
  }
});

// ═══════════════════════════════════════════════════════
// 7. enviarNotificacaoPrazo
//    Scheduled — sends push notifications 2h before each
//    match to users who haven't submitted predictions.
// ═══════════════════════════════════════════════════════
export const enviarNotificacaoPrazo = onSchedule(
  "every 30 minutes",
  async () => {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const ninetyMinFromNow = new Date(now.getTime() + 90 * 60 * 1000);

    const jogosSnap = await db
      .collection("jogos")
      .where("status", "==", "ABERTO")
      .get();

    for (const jogoDoc of jogosSnap.docs) {
      const data = jogoDoc.data();
      const matchTime = data.dataHora?.toDate?.() || new Date(data.dataHora);

      if (matchTime > ninetyMinFromNow && matchTime <= twoHoursFromNow) {
        const gruposSnap = await db.collection("grupos").get();

        for (const grupoDoc of gruposSnap.docs) {
          const membrosSnap = await db
            .collection(`grupos/${grupoDoc.id}/membros`)
            .get();

          for (const membroDoc of membrosSnap.docs) {
            const userId = membroDoc.id;
            const votoRef = db.doc(
              `grupos/${grupoDoc.id}/palpites/${jogoDoc.id}/votos/${userId}`
            );
            const votoSnap = await votoRef.get();

            if (!votoSnap.exists) {
              const userDoc = await db.doc(`usuarios/${userId}`).get();
              const fcmToken = userDoc.data()?.fcmToken;

              if (fcmToken) {
                try {
                  await admin.messaging().send({
                    token: fcmToken,
                    notification: {
                      title: "⏰ Prazo se aproxima!",
                      body: `1h para fechar o palpite: ${data.mandante} x ${data.visitante}`,
                    },
                    webpush: { fcmOptions: { link: "/jogos" } },
                  });
                } catch (err) {
                  console.error(`FCM error for ${userId}:`, err);
                }
              }
            }
          }
        }
      }
    }
  }
);
