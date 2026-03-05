# Solution Steps

1. Create the MongoDB assessment model:
- In backend/models/Assessment.js, define a Mongoose schema with fields: title (required string), skill (required string), difficulty (enum: Beginner/Intermediate/Advanced, default Beginner), and description (optional string).
- Enable timestamps on the schema so createdAt/updatedAt are stored automatically.
- Add a single-field index on the skill field using either `index: true` on the field or `AssessmentSchema.index({ skill: 1 })` so MongoDB can efficiently query assessments by skill.
- Export the model via `module.exports = mongoose.model('Assessment', AssessmentSchema);`.

2. Set up the Express server and MongoDB connection:
- In backend/server.js, import express, mongoose, cors, and dotenv.
- Initialize an Express app and add middleware: `cors()` and `express.json()`.
- Add a simple `/health` GET endpoint that returns a JSON object confirming the API is healthy.
- Import the assessment routes from `./routes/assessments` and mount them at `/api/assessments`.
- Add a 404 handler that returns a JSON `{ success: false, error: 'Route not found' }` for unknown routes.
- Add a centralized error handler that logs the error and returns a JSON `{ success: false, error: message }` with a 500 status by default.
- Read `PORT` and `MONGODB_URI` from environment variables (with sensible defaults), connect to MongoDB using `mongoose.connect`, and start the Express server only after a successful connection.

3. Implement the list and detail endpoints using real Mongoose queries:
- In backend/routes/assessments.js, create an Express router and import the Assessment model.
- Implement `GET /api/assessments`:
  - Read an optional `skill` query parameter.
  - Build a filter object (e.g., `{ skill }` if provided, otherwise `{}`).
  - Use `Assessment.find(filter).sort({ createdAt: -1 })` to fetch assessments from MongoDB.
  - Return a JSON response `{ success: true, data: assessments }`.
- Implement `GET /api/assessments/:id` (optional but recommended as the third endpoint):
  - Validate `req.params.id` using `mongoose.isValidObjectId`.
  - If invalid, return a 400 response with `{ success: false, error: 'Invalid assessment id' }`.
  - Use `Assessment.findById(id)` to fetch the document.
  - If not found, return a 404 response with `{ success: false, error: 'Assessment not found' }`.
  - On success, return `{ success: true, data: assessment }`.

4. Implement the create endpoint using a real MongoDB write:
- In backend/routes/assessments.js, add `POST /api/assessments`.
- Read `title`, `skill`, `difficulty`, and `description` from `req.body`.
- Validate that `title` and `skill` are present and non-empty; if not, return a 400 response with a clear error message.
- Call `Assessment.create({ title, skill, difficulty, description })`, trimming string fields and defaulting `difficulty` to `'Beginner'` and `description` to an empty string when needed.
- If a Mongoose validation error occurs, catch it and return a 400 response with `{ success: false, error: err.message }`.
- On success, return a 201 response with `{ success: true, data: assessment }`.

5. Replace the hardcoded React list with live data from the API:
- In frontend/src/App.jsx, define state with `useState` for: `assessments` (array), `loading` (boolean), and `error` (string/null).
- In a `useEffect` that runs on component mount, call an async `fetchAssessments` function.
- In `fetchAssessments`, set `loading` to true and `error` to null, then call `axios.get(`${API_BASE_URL}/api/assessments`)`.
- On success, set `assessments` to `response.data.data`.
- On failure, read an error message from `err.response?.data?.error` or fall back to a generic string and store it in `error`.
- In the JSX, show:
  - A "Loading assessments..." message when `loading` is true.
  - An error message block when `error` is non-null.
  - A "No assessments found" message when not loading, no error, and the array is empty.
  - Otherwise, render the assessments array in a list, using each item’s `_id` as the React key.

6. Wire the React form to the POST endpoint and update the list with the new document:
- In frontend/src/App.jsx, create `formValues` state (with fields title, skill, difficulty, description), plus `formError` and `isSubmitting` states.
- Implement `handleInputChange` that updates `formValues` based on `event.target.name` and `event.target.value`.
- Implement `handleSubmit` that:
  - Calls `event.preventDefault()`.
  - Validates that `title` and `skill` are non-empty; if invalid, sets `formError` and returns.
  - Sets `isSubmitting` to true and clears any previous `formError`.
  - Sends a POST request to `${API_BASE_URL}/api/assessments` with the trimmed `formValues`.
  - On success, reads the created assessment from `response.data.data` and prepends it to the `assessments` state array.
  - Resets `formValues` back to the initial state.
  - On error, sets `formError` using the backend message (or a generic fallback).
  - Finally, sets `isSubmitting` back to false.
- Bind `handleSubmit` to the form’s `onSubmit` and `handleInputChange` to each input/select/textarea.
- Use the `isSubmitting` flag to disable the submit button and show a "Saving..." label while the POST is in progress.

7. Render a clean catalog UI and verify index behavior:
- In the App component JSX, create two sections: one for the "Add New Assessment" form and another for the "Available Assessments" list.
- Use inline style objects or a basic CSS approach to make the UI readable and visually distinct for headings, form fields, list items, and error messages.
- In the list, display each assessment’s title, skill (as a badge), difficulty, creation date (from `createdAt`), and description when present.
- Ensure all API responses follow a consistent shape (`{ success, data }` on success and `{ success, error }` on failure), so the frontend can reliably read from `response.data.data` and `response.data.error`.
- Once the server is running and at least one document exists, open MongoDB (shell or Compass) and confirm that an index on the `skill` field exists for the assessments collection (e.g., via `db.assessments.getIndexes()`), verifying the single-field index requirement.

