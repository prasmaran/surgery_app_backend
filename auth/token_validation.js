const jwt = require("jsonwebtoken")

module.exports = {
    checkToken: (req, res, next) => {
        let token = req.get("authorization")
        if (token) {
            // Remove Bearer from string
            token = token.slice(7);
            jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
                if (err) {
                    // .status(403)
                    return res.send({
                        success: false,
                        message: "Invalid Token...",
                        result: null
                    })
                } else {
                    req.decoded = decoded;
                    next()
                }
            });
        } else {
            // .status(401).
            return res.send({
                success: false,
                message: "Unauthorized User or Session Expired",
                result: null
            })
        }
    }
}