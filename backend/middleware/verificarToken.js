
const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
    return res.status(401).json({
      mensaje: "Debes iniciar sesión"
    });
  }

  const token = autorizacion.split(" ")[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    req.usuario = datos;
    next();
  } catch {
    res.status(401).json({
      mensaje: "Sesión inválida o vencida"
    });
  }
}

module.exports = verificarToken;
