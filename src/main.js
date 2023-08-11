const Apify = require("apify");
const axios = require("axios");
const moment = require("moment");
const lodash = require("lodash");
Apify.main(async () => {
  let positions = [];
  try {
    var config = {
      method: "post",
      url: "https://www.binance.com/bapi/futures/v1/public/future/leaderboard/getOtherPosition",
      headers: {
        authority: "www.binance.com",
        accept: "*/*",
        "accept-language": "tr,en;q=0.9,tr-TR;q=0.8",
        clienttype: "web",
        "content-type": "application/json",
        lang: "en",
        origin: "https://www.binance.com",
        referer:
          "https://www.binance.com/en/futures-activity/leaderboard?type=myProfile&encryptedUid=EE0CE3F95107DE82428E8744053E85D3",
        "sec-ch-ua":
          '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
        Cookie: "cid=4C4kmgsb",
      },
      data: "{}",
    };
    const tradersConfig = config;
    tradersConfig.data = {
      limit: 50,
      sortType: "ROI",
      isShared: true,
      periodType: "MONTHLY",
      pnlGainType: null,
      roiGainType: null,
      symbol: "",
      tradeType: "PERPETUAL",
    };
    tradersConfig.url =
      "https://www.binance.com/bapi/futures/v1/public/future/leaderboard/searchLeaderboard";
    const tradersData = await axios(config);
    const allRequests = [];
    const traders = [];
    if (tradersData?.data?.data?.length > 0) {
      tradersData.data.data.forEach(async (trader) => {
        const roi = trader.roiValue * 100;
        if (trader.followerCount > 20 && roi > 100) {
          var data = JSON.stringify({
            encryptedUid: trader.encryptedUid,
            tradeType: "PERPETUAL",
          });
          config.data = data;
          config.url =
            "https://www.binance.com/bapi/futures/v1/public/future/leaderboard/getOtherPosition";
          allRequests.push(axios(config));
          traders.push(trader);
        }
      });
      const response = await axios.all(allRequests);
      response.forEach((res, index) => {
        if (
          res &&
          res.data &&
          res.data.data &&
          res.data.data.otherPositionRetList &&
          res.data.data.otherPositionRetList.length > 0
        ) {
          var otherPositionRetList = res.data.data.otherPositionRetList;
          var trader = traders[index];
          otherPositionRetList.forEach((otherPositionRet) => {
            let positionType = "--";
            const {
              symbol,
              amount,
              entryPrice,
              markPrice,
              pnl,
              roe,
              updateTimeStamp,
            } = otherPositionRet;
            var _roe = roe * 100;

            if (markPrice > entryPrice && pnl > 0) {
              positionType = "LONG";
            } else if (entryPrice > markPrice && pnl > 0) {
              positionType = "SHORT";
            } else if (entryPrice > markPrice && pnl < 0) {
              positionType = "LONG";
            } else if (entryPrice < markPrice && pnl < 0) {
              positionType = "SHORT";
            }
            _roe = _roe.toFixed(2);
            if (pnl && pnl !== 0) {
              positions.push({
                traderName: trader.nickName,
                traderWebPage:
                  "https://www.binance.com/en/futures-activity/leaderboard?type=myProfile&encryptedUid=" +
                  trader.encryptedUid,
                symbol: symbol,
                positionType,
                entryPrice: entryPrice,
                markPrice: markPrice,
                roe: _roe + "%",
                enteringTime: moment(updateTimeStamp).format(
                  "YYYY-DD-MM HH:mm:ss"
                ),
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.log("error", error.message);
  }
  if (positions && positions.length > 0) {
    positions = lodash.orderBy(
      positions,
      ["symbol", "positionType"],
      ["asc", "asc"]
    );
  }
  await Apify.pushData(positions);
});
