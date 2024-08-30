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

app.post('/api/tables/save', authenticateToken, async (req, res) => {
    try {
        const tables = req.body.tables;
        await prisma.guest.updateMany({
            where: {
                table_id: {
                    not: null
                },
                user_id: req.user.id
            },
            data: {
                table_id: null
            }
        });

        for (let table of tables) {
            for (let guest of table.guests) {
                await prisma.guest.update({
                    where: { id: guest.id },
                    data: { table_id: table.table.id }
                });
            }
        }

        res.status(200).send('Seating arrangement saved successfully.');
    } catch (error) {
        console.log('Error saving seating arrangement:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/tables/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {guestCount} = req.body;

        const dataToUpdate = {}
        if (guestCount!==null)
            dataToUpdate.places_count = parseInt(guestCount)

        const updatedGuest = await prisma.table.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
        });

        res.status(200).json(updatedGuest);
    } catch (error) {
        console.log('Error during guest update:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/api/guests/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {name, guestCount} = req.body;

        const dataToUpdate = {}
        if (name!==null)
            dataToUpdate.name = name
        if (guestCount!==null)
            dataToUpdate.count = parseInt(guestCount)

        const updatedGuest = await prisma.guest.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
        });

        res.status(200).json(updatedGuest);
    } catch (error) {
        console.log('Error during guest update:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/tables', authenticateToken, async (req, res) => {
    try {
        const { tableNumber, placesCount } = req.body
        if (!tableNumber || !placesCount)
            return res.status(400).send({ error: 'The payload is missing' })
        console.log( " req.user.id", req.user.id)
        const tableDoesExist = await prisma.table.findMany({
            where: {
                table_number: tableNumber,
                user_id: req.user.id
            },
        })
        console.log(tableDoesExist)
        if (tableDoesExist.length)
            return res.status(422).send({ error: 'The number table already exist'})

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
                table_id: true
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

        const list = [];
        let [tableIndex, guestIndex] = [0, 0];
        let totalPlacesCount = 0;
        tables.forEach((table) => {
            totalPlacesCount += table.places_count;
        });

        let totalGuests = 0;
        guestsByUser.forEach((guest) => {
            totalGuests += guest.count;
        });
        if (totalGuests > totalPlacesCount) {
            return res.status(422).send({error: "The guests number is smaller than chairs number"});
        }

        while(tableIndex < tables.length && sortedGuests.length > guestIndex ) {
            let currentTable = tables[tableIndex];
            let currentGuestsGroup = sortedGuests[guestIndex];

            let remainingSeats = currentTable.places_count - list.filter(l => l.table.id === currentTable.id).reduce((acc, l) => acc + l.guestsCount, 0);

            if(remainingSeats >= currentGuestsGroup.guestsCount) {
                list.push({
                    table: currentTable,
                    guests: currentGuestsGroup.guests,
                    guestsCount: currentGuestsGroup.guestsCount
                });

                currentGuestsGroup.guests.forEach(async (guest) => {
                    await prisma.guest.update({
                        where: { id: guest.id },
                        data: { 'table_id': currentTable.id },
                    });
                });
                sortedGuests.shift();
            } else if (remainingSeats > 0) {
                // If there are more guests than available seats, split the group
                let guestsToSeat = currentGuestsGroup.guests.splice(0, remainingSeats);
                list.push({
                    table: currentTable,
                    guests: guestsToSeat,
                    guestsCount: guestsToSeat.reduce((acc, g) => acc + g.count, 0)
                });

                guestsToSeat.forEach(async (guest) => {
                    await prisma.guest.update({
                        where: { id: guest.id },
                        data: { 'table_id': currentTable.id },
                    });
                });

                // Keep the remaining guests for further seating
                sortedGuests = Object.values(sortedGuests).sort((a, b) => b.guestsCount - a.guestsCount);
            }

            tableIndex++;
        }

        // Final pass to ensure all guests are seated
        for (let i = 0; i < sortedGuests.length; i++) {
            let remainingGuests = sortedGuests[i].guests;
            for (let j = 0; j < tables.length; j++) {
                if (remainingGuests.length === 0) break;
                let currentTable = tables[j];
                let availableSeats = currentTable.places_count - list.filter(l => l.table.id === currentTable.id).reduce((acc, l) => acc + l.guestsCount, 0);

                if (availableSeats > 0) {
                    let guestsToSeat = remainingGuests.splice(0, availableSeats);
                    guestsToSeat.forEach(async (guest) => {
                        await prisma.guest.update({
                            where: { id: guest.id },
                            data: { 'table_id': currentTable.id },
                        });
                    });

                    let tableEntry = list.find(l => l.table.id === currentTable.id);
                    if (tableEntry) {
                        tableEntry.guests.push(...guestsToSeat);
                        tableEntry.guestsCount += guestsToSeat.reduce((acc, g) => acc + g.count, 0);
                    } else {
                        list.push({
                            table: currentTable,
                            guests: guestsToSeat,
                            guestsCount: guestsToSeat.reduce((acc, g) => acc + g.count, 0)
                        });
                    }
                }
            }
        }

        res.status(201).json(list);
    } catch (error) {
        console.log('error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.delete('/api/tables/:tableNumber', authenticateToken, async (req, res) => {
    try {
        const {tableNumber} = req.params
        console.log("userid:" ,req.user.id)
        await prisma.table.delete({
            where: {
                user_id_table_number: {
                    table_number: parseInt(tableNumber),
                    user_id: req.user.id
                }
            },
        });
        res.status(200).json();
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.delete('/api/guests/:id', authenticateToken, async (req, res) => {
    try {
        const {id} = req.params
        await prisma.guest.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.listen(PORT, () => {
    console.log(`Server listening at port: ${PORT}`);
});