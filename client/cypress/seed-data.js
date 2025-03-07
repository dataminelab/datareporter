exports.seedData = [
  {
    route: "/setup",
    type: "form",
    data: {
      name: "Example Admin",
      email: "admin@redash.io",
      password: "password",
      org_name: "Redash",
    },
  },
  {
    route: "/login",
    type: "form",
    data: {
      email: "admin@redash.io",
      password: "password",
    },
  },
  {
    route: "/api/data_sources",
    type: "json",
    data: {
      name: "Test PostgreSQL",
      options: {
        dbname: "postgres",
        host: "postgres",
        port: 5432,
        sslmode: "prefer",
        user: "postgres",
      },
      type: "pg",
    },
  },
  {
    route: "/api/destinations",
    type: "json",
    data: {
      name: "Test Email Destination",
      options: {
        addresses: "test@example.com",
      },
      type: "email",
    },
  },
  {
    route: "/api/models",
    type: "json",
    data: {
      name: "Test data from reports table",
      data_source_id: 1,
      table: "reports"
    },
  },
  {
    route: "/api/reports",
    type: "json",
    data: {
      expression: "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggvAHoZAAmAProVupkAAqOWBEuoBEwDuhYuAQJAIwAmlZQ9sL4ALT5qp7eQvalIEoAui3UUMJIaGmEtcGlDhCcVhG",
      name: "test",
      model_id: 1,
      color_1: "#000",
      color_2: "#fff",
      data_source_id: 1,
    },
  },
];
