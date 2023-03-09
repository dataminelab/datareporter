import app from "./app";

const port = process.env.PLYWOOD_SERVER_PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
