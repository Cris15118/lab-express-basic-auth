const express = require("express");
const router = express.Router();

// aquí nuestras rutas de authentication
const User = require("../models/User.model.js");

const bcrypt = require("bcryptjs");

// GET "auth/signup"=> renderiza el formulario de registro
router.get("/signup", (req, res, next) => {
  res.render("auth/signup.hbs");
});

//POST "/auth/signup"=> recibe las info del usuario y crearlo en la BD
router.post("/signup", async (req, res, next) => {
  if (req.body.password === "" || req.body.username === "") {
    res.render("auth/signup.hbs", {
      errorMessage: "El campo usuario y  Contraseña son obligatorios",
    });
    return;
  }
  const regexPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  if (regexPattern.test(req.body.password) === false) {
    res.render("auth/signup.hbs", {
      errorMessage:
        "La contraseña no es fuerte, añade una mayuscula, un caracter especial y un número",
    });
    return;
  }
  try {
    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    await User.create({
      username: req.body.username,
      password: hashPassword,
    });
    res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
});

//GET "/auth/login"=> renderiza un formulario de acceso a la pagina
router.get("/login", (req, res, next) => {
  res.render("auth/login.hbs");
});

//POST"/auth/login"=> recibe las credenciales del usuario y validar su identidad
router.post("/login", async (req, res, next) => {
  if (req.body.password === "" || req.body.username === "") {
    res.render("auth/login.hbs", {
      errorMessage: "Los campos username y contraseña son obligatorios",
    });
    return;
  }
  try {
    const foundUser = await User.findOne({ username: req.body.username });
    if (foundUser === null) {
      res.render("auth/login.hbs", {
        errorMessage: "Usuario no registrado",
      });
      return;
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      foundUser.password
    );

    if (isPasswordCorrect === false) {
      res.render("auth/login.hbs", {
        errorMessage: "Contraseña no valida",
        username: req.body.username,
      });
      return;
    }
    req.session.User = foundUser;
    req.session.save(() => {
      res.redirect("/profile");
    });
  } catch (error) {
    next(error);
  }
});

// GET "/auth/logout"=> Cerrar (Destruir) la sesion activa
router.get("/logout", (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
