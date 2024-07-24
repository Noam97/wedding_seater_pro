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
        const { tableNumber, placesCount } = req.body
        if (!tableNumber || !placesCount)
            return res.status(400).send({ error: 'The payload is missing' })
        const tableDoesExist = await prisma.table.findUnique({
            where: {
                table_number: tableNumber
            },
        })
        console.log(tableDoesExist)
        if (tableDoesExist)
            return res.status(422).send({ error: 'The number table already exist'})

        // Create a new guest into the database
        const newTable = await prisma.table.create({
            data: {
                table_number: parseInt(tableNumber),
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
        const guestsByUser = await prisma.guest.findMany({
            select: {
                side: true,
                closeness: true,
                count: true,
                name: true,
                id: true,
            },
            where: {
                user_id: req.user.id
            },
        });
        const groupedGuests = guestsByUser.reduce((acc, guest) => {
            const key = `${guest.side}-${guest.closeness}`;
            acc[key] = acc[key] || { side: guest.side, closeness: guest.closeness, guestsCount: 0, guests: [] };
            acc[key].guestsCount += guest.count;
            acc[key].guests.push(guest);
            return acc;
        }, {});

        let sortedGuests = Object.values(groupedGuests).sort((a, b) => b.guestsCount - a.guestsCount);

        const tables = await prisma.table.findMany({
            where: {
                user_id: req.user.id
            },
            orderBy: {
                places_count: 'desc'
            }
        });
        const list = []
        let [tableIndex, guestIndex] = [0, 0]

        while(tableIndex < tables.length) {
            if(tables[tableIndex]['places_count'] >= sortedGuests[guestIndex].guestsCount) {
                list.push({
                    table: tables[tableIndex],
                    guests: sortedGuests[guestIndex].guests,
                    guestsCount: sortedGuests[guestIndex].guestsCount
                })
                sortedGuests[guestIndex].guests.forEach(async (guest) => {
                    await prisma.guest.update({
                        where: {
                            id: guest.id,
                        },
                        data: {
                            'table_id': tables[tableIndex].id,
                        },
                    })
                })
                sortedGuests.shift()
            }
            else {
                function maxGuestCount(number, counts) {
                    let max = 0;
                    let bestSubset = [];

                    function backtrack(start, currentSubset, currentCount) {
                        if (currentCount <= number && currentCount > max) {
                            max = currentCount;
                            bestSubset = [...currentSubset];
                        }

                        for (let i = start; i < counts.length; i++) {
                            if (currentCount + counts[i].count <= number) {
                                currentSubset.push(counts[i]);
                                backtrack(i + 1, currentSubset, currentCount + counts[i].count);
                                currentSubset.pop();
                            }
                        }
                    }

                    backtrack(0, [], 0);

                    // Create the remaining array by filtering out the counts in the best subset
                    let remaining = counts.filter(weight => !bestSubset.includes(weight));

                    return {
                        max: max,
                        maxSubset: bestSubset,
                        remainingCounts: remaining
                    };
                }

                const { max, maxSubset, remainingCounts } = maxGuestCount(tables[tableIndex]['places_count'], sortedGuests[guestIndex].guests)

                list.push({
                    table: tables[tableIndex],
                    guests: maxSubset,
                    guestsCount: max
                })

                maxSubset.forEach(async (guest) => {
                    await prisma.guest.update({
                        where: {
                            id: guest.id,
                        },
                        data: {
                            'table_id': tables[tableIndex].id,
                        },
                    })
                })

                sortedGuests.push({
                    side: remainingCounts[0].side,
                    closeness: remainingCounts[0].closeness,
                    guestsCount: sortedGuests[guestIndex].guestsCount - max,
                    guests: remainingCounts
                })
                sortedGuests.shift()

                sortedGuests = Object.values(sortedGuests).sort((a, b) => b.guestsCount - a.guestsCount);
            }

            tableIndex++
        }

        res.status(201).json(list);
    } catch (error) {
        console.log('error', error)
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.listen(PORT, () => {
    console.log(`Server listening at port: ${PORT}`);
});