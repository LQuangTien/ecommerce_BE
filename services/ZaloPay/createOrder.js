const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const uuid = require('uuid').v1; // npm install uuid
const moment = require('moment'); // npm install moment
const { ServerError, BadRequest, Create, Get } = require("../../ulti/response");

exports.zaloCreateOrder = (orderIdFromServer, orderItemFromServer, orderPriceFromServer) => {
  //dữ liệu dc callback cho server khi thanh toán thành công
  const embeddata = {
    // merchantinfo: orderIdFromServer,
    redirecturl: "https://ecommerce-client-teal.vercel.app",//"http://localhost:3000/",
  };

  //danh sách sản phẩm
  // const items = orderItemFromServer;
  const items = [
    // itemid: "knb",
    // itemname: "kim nguyen bao",
    // itemprice: 198400,
    // itemquantity: 1
    ...orderItemFromServer
  ];

  const transID = Math.floor(Math.random() * 1000000);
 
  const order = {
    appid: process.env.ZALO_APPID,
    apptransid: `${moment().format('YYMMDD')}_${transID}`, // mã giao dich có định dạng yyMMdd_xxxx
    appuser: "demo",
    apptime: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embeddata: JSON.stringify(embeddata),
    amount: orderPriceFromServer,
    description: `Kinzy - Payment for the order #${transID}`,
    bankcode: "zalopayapp",
  };

  console.log("ordr",order);
  // appid|apptransid|appuser|amount|apptime|embeddata|item
  const data = process.env.ZALO_APPID + "|" + order.apptransid + "|" + order.appuser + "|" + order.amount + "|" + order.apptime +
    "|" + order.embeddata + "|" + order.item;

  order.mac = CryptoJS.HmacSHA256(data, process.env.ZALO_KEY_FOR_SERVER_REQUEST).toString();

  return axios.post(process.env.ZALO_CREATE_ORDER_API, null, { params: order })
    .then(res => {
      res.data.apptransid = order.apptransid;
      return res.data;
    })
    .catch(err => err);
}