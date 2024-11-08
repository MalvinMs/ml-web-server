const Hapi = require("@hapi/hapi");
const { loadModel, predict } = require("./interference");
async () => {
  const model = await loadModel();
  console.log("model loaded!");

  const server = Hapi.server({
    host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
    port: process.env.NODE_ENV !== "production" ? 3000 : 80,
  });

  server.route({
    method: "POST",
    path: "/predicts",
    handler: async (request) => {
      const { image } = request.payload;
      const prediction = await predict(model, image);
      const [paper, rock] = prediction;

      if (paper) {
        return { result: "paper" };
      }
      if (rock) {
        return { result: "rock" };
      }
      return { result: "scissors" };
    },

    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
      },
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};
