import {hash} from "@node-rs/argon2";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const users = [
    {
        username: "admin",
        email: "admin@admin.com",
        role: "ADMIN" as const,
    },
    {
        username: "user",
        // replace with your own email
        email: "traveler@example.com",
        role: "CUSTOMER" as const,
    },
];

const inDays = (days: number) =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const tours = [
    {
        title: "Island Hopping Adventure",
        destination: "El Nido, Palawan, Philippines",
        content:
            "3 days / 2 nights. Boat tours A and C, lagoon kayaking, beach picnic lunches and hotel pickup included.",
        status: "OPEN" as const,
        departureDate: inDays(21),
        price: 29900,
    },
    {
        title: "Cultural Heritage Walk",
        destination: "Taipei, Taiwan",
        content:
            "Full-day guided walk through temples, night markets and old streets, with tea tasting.",
        status: "FULLY_BOOKED" as const,
        departureDate: inDays(10),
        price: 8900,
    },
    {
        title: "Sunrise Summit Trek",
        destination: "Mt. Pulag, Philippines",
        content:
            "Overnight trek to catch the sea of clouds at sunrise. Guide, permits and breakfast included.",
        status: "COMPLETED" as const,
        departureDate: inDays(-14),
        price: 14900,
    },
];

const comments = [
    {content: "Is airport pickup included?"},
    {content: "Yes, hotel and airport pickup are covered."},
    {content: "Booked! Can't wait."},
];

const seed = async () => {
    const t0 = performance.now();
    console.log("DB Seed: Started ...");

    await prisma.booking.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await hash("geheimnis");

    const dbUsers = await prisma.user.createManyAndReturn({
        data: users.map((user) => ({
            ...user,
            passwordHash,
        })),
    });

    const dbTours = await prisma.tour.createManyAndReturn({
        data: tours.map((tour) => ({
            ...tour,
            userId: dbUsers[0].id,
        })),
    });

    await prisma.comment.createMany({
        data: comments.map((comment) => ({
            ...comment,
            tourId: dbTours[0].id,
            userId: dbUsers[1].id,
        })),
    });

    await prisma.booking.createMany({
        data: [
            {
                tourId: dbTours[0].id,
                userId: dbUsers[1].id,
                guests: 2,
                totalAmount: dbTours[0].price * 2,
                status: "PAID",
                paidAt: new Date(),
                paymentRef: "TEST-SEED0001",
            },
            {
                tourId: dbTours[0].id,
                userId: dbUsers[1].id,
                guests: 1,
                totalAmount: dbTours[0].price,
                status: "PENDING",
            },
        ],
    });

    const t1 = performance.now();
    console.log(`DB Seed: Finished (${t1 - t0}ms)`);
    console.log("Admin:    admin@admin.com / geheimnis");
    console.log("Customer: traveler@example.com / geheimnis");
};

seed();