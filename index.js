require("dotenv").config();

const Telegraf = require("telegraf");
const sozluk = require("sozlukjs");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on("inline_query", async ctx => {
	try {
		const meaningTDK = await sozluk.TDKDictionary.getMeaningData(
			ctx.update.inline_query.query
		);
		const meaningTureng = await sozluk.TurengDictionary.getTermData(
			ctx.update.inline_query.query
		);
		let result = [];
			if (!meaningTDK.error) {
			result = meaningTDK.map(e => {
					return {
						type: "article",
						id: `${e.kelime_no}: ${e.madde_id}`,
						title: "TDK: " + e.madde,
						description:
							e.anlamlarListe[0].anlam.substring(0, 50) + "...",
						input_message_content: {
							message_text:
								`<b>${e.madde}</b>\n\n` +
								e.anlamlarListe
									.map(
										(e, index) =>
											`<b>${index + 1}.</b> ${e.anlam}`
									)
									.join("\n"),
							parse_mode: "HTML"
						}
					};
				});
		}
		
		if (!meaningTureng.Results) {
			result.push({
				type: "article",
				id: meaningTureng.MobileResult.Term,
				title: "Tureng: " + meaningTureng.MobileResult.Term,
				description: meaningTureng.MobileResult.Results[0].Term,
				input_message_content: {
					message_text:
						`<b>${meaningTureng.MobileResult.Term}</b>\n\n` +
						meaningTureng.MobileResult.Results.map(
							(e, index) =>
								`<b>${index + 1}.</b> <i>${e.TypeEN ? e.TypeEN : ""} ${
									e.CategoryTR ? e.CategoryTR : ""
								}</i>: ${e.Term}`
						).join("\n"),
					parse_mode: "HTML"
				}
			});
		}
		result.unshift({
			type: "article",
			id: 0,
			title: "Sponsor Reklam",
			description: "<metin>",
			input_message_content: {
				message_text: "<metin>"
			}
		});


		ctx.answerInlineQuery(result);
	} catch (err) {
		console.error(err);
    }
});

bot.launch();
