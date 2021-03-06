const express = require('express');
const app = express();
var server = require('http').Server(app);
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 5001;
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var io = require('socket.io')(server);
var uuid = require('uuid/v4');
const MongoStore = require('connect-mongo')(session);
var sharedsession = require('express-socket.io-session');
mongoose.Promise = global.Promise;
require('dotenv').config();

/* Define routes */
var auth = require('./routes/auth');
var index = require('./routes/index');
var legal = require('./routes/legal');
var user = require('./routes/user/user');
var image = require('./routes/developer/image');
var notificationGroup = require('./routes/developer/notificationGroup');
var developer = require('./routes/developer/developer');
var organisation = require('./routes/developer/organisation');
var clientAPIv1 = require('./routes/api/client-v1');
var issuerAPIv1 = require('./routes/api/issuer-v1');

/* Define sockets */
var account_sock = require('./sockets/auth/account');
var device_sock = require('./sockets/user/device');
var notificationGroup_sock = require('./sockets/developer/notificationGroup');

/* Remove deprecated settings from mongoose */
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

/* Define mongoDB details*/
const mongoDetails = {
  dbName: process.env.MONGO_DB,
  user: process.env.MONGO_USER,
  password: process.env.MONGO_PASSWORD,
  cluster: process.env.MONGO_CLUSTER
}
const uri = 'mongodb+srv://'+mongoDetails.user+':'+mongoDetails.password+'@'+mongoDetails.cluster+'-'+process.env.MONGO_STRING+'.mongodb.net/'+mongoDetails.dbName+'?authSource=admin&retryWrites=true';

/* Connect to mongoDB*/
mongoose.connect(uri)
  .then(() =>  console.log('[INFO] MongoDB connected successfully'))
  .catch((err) => console.error(err));

/* define how to use session */
var mongooseSession = session({
  genid: function(req) {
    return uuid() // use UUIDs for session IDs
  },
  secret: 'kjlhsdklh28o8712hkq3798w31jbk',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection, stringify: false}),
  cookie: {secure: false}
});

/* define which template to view at each address*/
app.use(express.static(path.join(__dirname, 'public')))
  .use(mongooseSession)
  .use(passport.initialize())
  .use(passport.session())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use('/', index)
  .use('/auth', auth)
  .use('/legal', legal)
  .use('/user', user)
  .use('/image', image)
  .use('/organisation', organisation)
  .use('/developer', developer)
  .use('/notification-group', notificationGroup)
  .use('/api/client-v1', clientAPIv1)
  .use('/api/v1', issuerAPIv1)
  .set('views', path.join(__dirname, 'public/views/pages'))
  .set('view engine', 'ejs');

server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

io.use(sharedsession(mongooseSession)); // can access session from within 'io' with 'socket.handshake.session'
io.on('connection', function(socket){

  // Load socket configuration from external files.
  account_sock.sock(socket, io);
  device_sock.sock(socket, io);
  notificationGroup_sock.sock(socket, io);

  socket.on('disconnect', function() {
  });
});
