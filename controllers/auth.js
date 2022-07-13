const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const shortId = require("shortid");
const statusCode = require("http-status-codes");

const User = require("../models/user");
const {
  Get,
  ServerError,
  Response,
  BadRequest,
  Unauthorized,
} = require("../ulti/response");

const ONE_SECCOND = 1000;
const ONE_MiNUTE = ONE_SECCOND * 60;
const ONE_HOUR = ONE_MiNUTE * 60;

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) return ServerError(res, error);
    if (user) return BadRequest(res, "User already registered");
    const { firstName, lastName, email, password } = req.body;
    try {
      const hash_password = await bcrypt.hash(password, 10);
      const newUser = User({
        firstName,
        lastName,
        email,
        hash_password,
        username: `${firstName} ${lastName}`,
        activeCode: shortId.generate(),
      });
      newUser.save((error, user) => {
        //test bỏ cái này thử
        if (error) return ServerError(res, error.message);
        if (user) {
          const token = jwt.sign(
            {
              _id: user._id,
              role: user.role,
              exp: Math.floor(Date.now()) + ONE_HOUR,
            },
            process.env.JWT_SECRET
          );
          const { firstName, lastName, email, fullName } = user;
          sendActiveEmail(user.email, user._id, user.activeCode);
          return Response(res, {
            result: "Your account has been created, please check your mail to active it"
          });
        }
      });
    } catch (error) {
      return ServerError(res, error.message);
    }
  });
};
exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) return ServerError(res, error);
    if (!user) return BadRequest(res, "User does not exist");
    if (user.status === "pending") return BadRequest(res, "Unactive account");
    const isAuthen = await user.authenticate(req.body.password);
    if (!isAuthen) return BadRequest(res, "Wrong password");
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        exp: Math.floor(Date.now()) + ONE_HOUR,
      },
      process.env.JWT_SECRET
    );
    const { firstName, lastName, email, fullName } = user;
    return Response(res, {
      token,
      user: { firstName, lastName, email, fullName },
    });
  });
};
exports.signout = (req, res) => {
  return Response(res, { message: "Signout successfully ...!" });
};

exports.forgetPassword = async (req, res) => {
  try {
    const emailExist = await User.findOne({ email: req.body.userEmail });

    if (!emailExist) return BadRequest(res, "Email chưa được đăng ký");

    const newPassword = await updateNewPasswordForForgetPassword(
      req.body.userEmail
    );
    const mailInfo = await sendEmail(req.body.userEmail, newPassword);

    return Get(res, { sent: mailInfo });
  } catch (error) {
    return ServerError(res, { error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const newHashPassword = await bcrypt.hash(req.body.password, 10);

    const updatedUser = await User.findOneAndUpdate(
      { email: req.body.email },
      { $set: { hash_password: newHashPassword } },
      { new: true, useFindAndModify: false }
    );

    return Get(res, updatedUser);
  } catch (error) {
    return ServerError(res, error.message);
  }
};

async function updateNewPasswordForForgetPassword(userEmail) {
  const randomPassword = shortId.generate();
  const hashPassword = await bcrypt.hash(randomPassword, 10);
  await User.findOneAndUpdate(
    { email: userEmail },
    { $set: { hash_password: hashPassword } },
    { new: true, useFindAndModify: false }
  );

  return randomPassword;
}

async function sendEmail(userEmail, newPwd) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "quangtienclone@gmail.com",
      pass: "oxzepjylslupdfdy",
    },
  });

  // send mail with defined transport object
  return await transporter.sendMail({
    from: "kinzyproduction@gmail.com", // sender address
    to: userEmail, // list of receivers
    subject: "Change password success ✔", // Subject line
    text: "This is your new Password: " + newPwd, // plain text body
    html: "<b>" + "This is your new Password: " + newPwd + "</b>", // html body
  });
}

exports.active = async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) return BadRequest(res, "User does not exist");

  if (!(user.activeCode === req.params.activeCode)) return BadRequest(res, "Active code does not exist");

  await User.findOneAndUpdate(
    { _id: req.params.userId },
    { $set: { status: "active" } },
    { new: true, useFindAndModify: false }
  );

  return Get(res, { result: "Active account success" });
};

async function sendActiveEmail(userEmail, userId, activeCode) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "quangtienclone@gmail.com",
      pass: "oxzepjylslupdfdy",
    },
  });

  // send mail with defined transport object
  return await transporter.sendMail({
    from: "kinzyproduction@gmail.com", // sender address
    to: userEmail, // list of receivers
    subject: "Active account  ✔", // Subject line
    text: "This is your active link: " + `$https://ecommerce-client-teal.vercel.app/active?id=${userID}&activeCode=${activeCode}`, // plain text body
    html: "<b>" + "This is your active link: " + `$https://ecommerce-client-teal.vercel.app/active?id=${userID}&activeCode=${activeCode}` + "</b>", // html body
  });
}

exports.googleSignin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) return ServerError(res, error);
    if (user) {
      const token = jwt.sign(
        {
          _id: user._id,
          role: user.role,
          exp: Math.floor(Date.now()) + ONE_HOUR,
        },
        process.env.JWT_SECRET
      );
      const { firstName, lastName, email, fullName } = user;
      return Response(res, {
        token,
        user: { firstName, lastName, email, fullName },
      });
    } else {
      const { firstName, lastName, email } = req.body;
      try {
        const newUser = User({
          firstName,
          lastName,
          email,
          username: `${firstName} ${lastName}`,
          accountType: "google",
        });
        newUser.save((error, user) => {
          if (error) return ServerError(res, error.message);
          if (user) {
            const token = jwt.sign(
              {
                _id: user._id,
                role: user.role,
                exp: Math.floor(Date.now()) + ONE_HOUR,
              },
              process.env.JWT_SECRET
            );
            const { firstName, lastName, email, fullName } = user;
            return Response(res, {
              token,
              user: { firstName, lastName, email, fullName },
            });
          }
        });
      } catch (error) {
        return ServerError(res, error.message);
      }
    }
  });
};
