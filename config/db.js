const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      // สำคัญมากสำหรับ Supabase เนื่องจากต้องใช้ SSL/TLS
      require: false,
      rejectUnauthorized: false, // ในบางสภาพแวดล้อม dev อาจจำเป็นต้องตั้งค่านี้,
      // แต่ใน Production ควรตรวจสอบใบรับรองให้ถูกต้อง
    },
  },
  logging: false, // ตั้งเป็น true เพื่อดู SQL queries ใน console
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      "Supabase (PostgreSQL) Connection has been established successfully."
    );

    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error(
      "Unable to connect to the Supabase (PostgreSQL) database:",
      error
    );
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };
