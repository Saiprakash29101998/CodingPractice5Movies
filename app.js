const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
module.exports = app;

const dbPath = path.join(__dirname, "moviesData.db");
const convertDBObjToResponseObj = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
};
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3021, () => {
      console.log("Server Started at http://localhost:3021");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message} `);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name
    FROM movie
    `;
  let moviesArray = await db.all(getMoviesQuery);
  moviesArray = moviesArray.map(movieSnakeToCamel);
  response.send(moviesArray);
});

//API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}')
    `;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId}
    `;
  let movie = await db.get(getMovieQuery);
  movie = movie.map(movieSnakeToCamel);
  response.send(movie);
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE movie
  SET 
    movie_id = ${movieId},
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId}
  `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId}
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
const directorSnakeToCamel = (dirObj) => {
  return {
    directorId: dirObj.director_id,
    directorName: dirObj.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * 
    FROM 
    director
    `;
  let directorsArray = await db.all(getDirectorsQuery);
  directorsArray = directorsArray.map(directorSnakeToCamel);
  response.send(directorsArray);
});

//API 7
const movieSnakeToCamel = (dirObj) => {
  return {
    movieName: dirObj.movie_name,
  };
};
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesOfDirectorsQuery = `
    SELECT movie_name
    FROM movie
    INNER JOIN director
    ON movie.director_id = director.director_id
    WHERE movie.director_id = ${directorId}
    `;
  let moviesOfDirectorsArray = await db.all(getMoviesOfDirectorsQuery);
  moviesOfDirectorsArray = moviesOfDirectorsArray.map(movieSnakeToCamel);
  response.send(moviesOfDirectorsArray);
});
