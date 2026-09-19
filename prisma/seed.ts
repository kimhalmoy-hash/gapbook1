import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { addDays, addHours } from "../lib/slots";
import { feeAmount, feePercentForPriorCount } from "../lib/fees";

const prisma = new PrismaClient();

async function main() {
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@gapbook.no",
      name: "GapBook Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "kunde@demo.gapbook.no",
      name: "Kari Nordmann",
      role: "CUSTOMER",
      passwordHash,
    },
  });

  const painter = await prisma.user.create({
    data: {
      email: "maler@demo.gapbook.no",
      name: "Espen Maler",
      role: "BUSINESS",
      passwordHash,
      business: {
        create: {
          name: "Nordlys Mal & Tapet AS",
          orgNr: "923456789",
          country: "NO",
          city: "Oslo",
          trades: ["PAINTING"],
          approved: true,
        },
      },
    },
    include: { business: true },
  });

  const electrician = await prisma.user.create({
    data: {
      email: "elektriker@demo.gapbook.se",
      name: "Lina Ström",
      role: "BUSINESS",
      passwordHash,
      business: {
        create: {
          name: "Södermalm El AB",
          orgNr: "556123-4567",
          country: "SE",
          city: "Stockholm",
          trades: ["ELECTRICIAN"],
          approved: true,
        },
      },
    },
    include: { business: true },
  });

  const plumber = await prisma.user.create({
    data: {
      email: "rorlegger@demo.gapbook.no",
      name: "Omar Rør",
      role: "BUSINESS",
      passwordHash,
      business: {
        create: {
          name: "Pipelink Oslo AS",
          orgNr: "987654321",
          country: "NO",
          city: "Oslo",
          trades: ["PLUMBER"],
          approved: true,
        },
      },
    },
    include: { business: true },
  });

  await prisma.user.create({
    data: {
      email: "tak@demo.gapbook.no",
      name: "Tove Tak",
      role: "BUSINESS",
      passwordHash,
      business: {
        create: {
          name: "Fjelltak AS",
          orgNr: "911222333",
          country: "NO",
          city: "Oslo",
          trades: ["ROOFING"],
          approved: false,
        },
      },
    },
  });

  const now = new Date();
  now.setMinutes(0, 0, 0);
  const dayStart = (daysAhead: number, hour = 8) => {
    const date = addDays(now, daysAhead);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const painterBiz = painter.business!;
  const electricianBiz = electrician.business!;
  const plumberBiz = plumber.business!;

  const openHours = await prisma.slot.create({
    data: {
      businessId: painterBiz.id,
      trade: "PAINTING",
      country: "NO",
      city: "Oslo",
      unit: "HOURS",
      startsAt: dayStart(5, 9),
      endsAt: addHours(dayStart(5, 9), 4),
      durationHours: 4,
      priceAmount: 2800,
      currency: "NOK",
      suitableFor: "Oppmaling av ett rom, ferdig gips.",
      cancellationFeeAmount: 800,
      status: "OPEN",
    },
  });

  await prisma.slot.create({
    data: {
      businessId: painterBiz.id,
      trade: "PAINTING",
      country: "NO",
      city: "Oslo",
      unit: "DAY",
      startsAt: dayStart(8, 8),
      endsAt: addHours(dayStart(8, 8), 8),
      durationHours: 8,
      priceAmount: 5200,
      currency: "NOK",
      suitableFor: "Tapetsering av stue (inntil 40 m²).",
      cancellationFeeAmount: 1500,
      status: "OPEN",
    },
  });

  await prisma.slot.create({
    data: {
      businessId: plumberBiz.id,
      trade: "PLUMBER",
      country: "NO",
      city: "Oslo",
      unit: "HOURS",
      startsAt: dayStart(6, 10),
      endsAt: addHours(dayStart(6, 10), 6),
      durationHours: 6,
      priceAmount: 3900,
      currency: "NOK",
      suitableFor: "Bytte blandebatteri og enkel service.",
      status: "OPEN",
    },
  });

  await prisma.slot.create({
    data: {
      businessId: electricianBiz.id,
      trade: "ELECTRICIAN",
      country: "SE",
      city: "Stockholm",
      unit: "WEEK",
      startsAt: dayStart(10, 8),
      endsAt: addDays(dayStart(10, 8), 7),
      durationHours: 168,
      priceAmount: 18500,
      currency: "SEK",
      suitableFor: "Småjobber og service i leilighet/rekkehus.",
      cancellationFeeAmount: 2500,
      status: "OPEN",
    },
  });

  const bookedOne = await prisma.slot.create({
    data: {
      businessId: electricianBiz.id,
      trade: "ELECTRICIAN",
      country: "SE",
      city: "Stockholm",
      unit: "DAY",
      startsAt: dayStart(3, 8),
      endsAt: addHours(dayStart(3, 8), 8),
      durationHours: 8,
      priceAmount: 6400,
      currency: "SEK",
      suitableFor: "Montering av downlights i ett rom.",
      status: "BOOKED",
    },
  });

  const bookedTwo = await prisma.slot.create({
    data: {
      businessId: electricianBiz.id,
      trade: "ELECTRICIAN",
      country: "SE",
      city: "Stockholm",
      unit: "HOURS",
      startsAt: dayStart(2, 12),
      endsAt: addHours(dayStart(2, 12), 3),
      durationHours: 3,
      priceAmount: 2100,
      currency: "SEK",
      suitableFor: "Feilsøking sikringsskap.",
      status: "BOOKED",
    },
  });

  const firstAccepted = addDays(now, -4);
  await prisma.booking.create({
    data: {
      slotId: bookedOne.id,
      customerId: customer.id,
      businessId: electricianBiz.id,
      agreementAcceptedAt: firstAccepted,
      confirmationStubAt: firstAccepted,
      customerEmail: customer.email,
      status: "CONFIRMED",
      feePercent: feePercentForPriorCount(0),
      feeAmount: feeAmount(6400, feePercentForPriorCount(0)),
      createdAt: firstAccepted,
    },
  });

  const secondAccepted = addDays(now, -1);
  await prisma.booking.create({
    data: {
      slotId: bookedTwo.id,
      customerId: customer.id,
      businessId: electricianBiz.id,
      agreementAcceptedAt: secondAccepted,
      confirmationStubAt: secondAccepted,
      customerEmail: customer.email,
      status: "CONFIRMED",
      feePercent: feePercentForPriorCount(1),
      feeAmount: feeAmount(2100, feePercentForPriorCount(1)),
      createdAt: secondAccepted,
    },
  });

  console.log("Seeded GapBook demo data.");
  console.log("Admin:", admin.email);
  console.log("Customer:", customer.email);
  console.log("Open sample slot:", openHours.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
