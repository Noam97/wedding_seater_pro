import jwt from 'jsonwebtoken'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
    // Get the token from the header
    const token = req.headers['authorization'];
    if (token == null) return res.sendStatus(401); // If there's no token, return 401

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
        if (err) return res.sendStatus(403); // If the token is invalid, return 403

        try {
            const user = await prisma.user.findUnique({
                where: { id: payload.userId }
            });

            if (!user) return res.sendStatus(404);

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.sendStatus(500);
        }
    });
};