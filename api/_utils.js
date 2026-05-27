module.exports = function handler(req,res){ res.setHeader('content-type','application/json; charset=utf-8'); res.statusCode=404; res.end(JSON.stringify({ok:false,error:'internal helper'})); };
