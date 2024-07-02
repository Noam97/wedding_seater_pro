import express from 'express'
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import {PrismaClient} from "@prisma/client";
import jwt from 'jsonwebtoken';
import { authenticateToken } from './middleware/auth.js'

const app = express();
app.use(cors())
app.use(bodyParser.json());
const prisma = new PrismaClient();
const PORT = 3200;

app.get('/', (req, res) => {
    res.send('Started Working, Express!');
});

app.post('/api/login', async (request, response) => {
    const { email, password } = request.body
    try {
        const user = await prisma.user.findFirst({
            where: { email }
        })

        if(!user) return response.status(422).send({ error: 'Email or password is invalid' });

        bcrypt.compare(password, user.password, (err, res) => {
            if(err) return response.status(422).send({ error: 'Email or password is invalid' });

            if(res) {
                const token = jwt.sign({ userId : user.id }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
                return response.send({token});
            }
            else
                return response.status(401).send({ error: "Invalid credential" })
        });

    } catch (error) {
        return response.status(400).send({ error: 'Email or password is invalid' })
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body

        if (!firstName.length || !lastName.length || !email.length || !password.length)
            return res.status(400).send({ error: 'The payload is missing' })

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create a new user into the database
        const newUser = await prisma.user.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                email,
                password: passwordHash,
            },
        });

        res.status(201).json({ user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/api/guests', authenticateToken, async (req, res) => {
    try {
        const { name, guestsCount, side, closeness } = req.body

        if (!name.length || !guestsCount || !side.length || !closeness.length)
            return res.status(400).send({ error: 'The payload is missing' })

        // Create a new guest into the database
        const newGuest = await prisma.guest.create({
            data: {
                name,
                count: guestsCount,
                side,
                closeness,
                user_id: req.user.id
            },
        });

        res.status(201).json(newGuest);
    } catch (error) {
        console.error('Error creating a guest:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/api/guests', authenticateToken, async (req, res) => {
    try {
        const guests = await prisma.guest.findMany({
            where: {
                user_id: req.user.id
            },
            include: {
                table: true,
            },
        });
        res.status(200).json(guests);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/api/tables', authenticateToken, async (req, res) => {
    try {
        const { name, placesCount } = req.body

        if (!name.length || !placesCount)
            return res.status(400).send({ error: 'The payload is missing' })

        // Create a new guest into the database
        const newTable = await prisma.table.create({
            data: {
                name,
                places_count: placesCount,
                user_id: req.user.id
            },
        });

        res.status(201).json(newTable);
    } catch (error) {
        console.error('Error creating a guest:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/api/tables', authenticateToken, async (req, res) => {
    try {
        const tables = await prisma.table.findMany({
            where: {
                user_id: req.user.id
            }
        });
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/api/tables/generate', authenticateToken, async (req, res) => {
    try {
        const guests = await prisma.table.findMany();
        res.status(200).json(guests);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/api/tables/genereta', async (req, res) => {
    // @TODO the real algorithm is here !!!!

    // try {
    //     const guests = await prisma.guest.findMany();
    //     res.status(200).json(guests);
    // } catch (error) {
    //     res.status(500).json({ error: 'Internal server error' });
    // }
})

app.listen(PORT, () => {
    console.log(`Server listening at port: ${PORT}`);
});