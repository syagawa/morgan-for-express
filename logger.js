const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const path = require("path");
const fs = require("fs");

const base_name = "access.log";

const filenameGenerator = function(time, index){
  const pad = function(num){
    return (num > 9 ? "" : "0") + num;
  };
  
  let d = time;
  if (!time){
    d = new Date();
  }
  let ind = index;
  if(!index){
    ind = 0;
  }
  ind++;

  const month = d.getFullYear() + "" + pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());
  return `${month}/${month}${day}-${hour}${minute}-${ind}-${base_name}`;
};

const makeAndSetLogger = function({ app, dir }){

  const log_dir = path.join(__dirname, dir);
  fs.existsSync(log_dir) || fs.mkdirSync(log_dir);
  const accessLogStream = rfs.createStream(filenameGenerator, {
    size:'10MB',
    interval: '10d',
    compress: 'gzip',
    path: log_dir,
  });
  morgan.token('custom_token', function getId (req) {
    const return_log = "first:"+req.body["first"] + "\t second:" + req.body["second"];
    return return_log;
  });
  const morgan_format = morgan.compile(":date, :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms");
  app.use(morgan(
    morgan_format,
    {
      stream: accessLogStream,
      skip: function(req, res){
        const url = req.url;
        const error = res.statusCode >= 400;
        if(error){
          return false;
        }
        let is_image = false;
        if(url.match(/.+\.jpg/) || url.match(/.+\.gif/) || url.match(/.+\.png/) ){
          is_image = true;
        }
        if(is_image){
          return true;
        }
        return false;
      },
    }
  ));
};


module.exports = {
  makeAndSetLogger: makeAndSetLogger
};