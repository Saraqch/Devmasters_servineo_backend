import { Router } from "express";
import { discordAuth } from "../../controllers/userManagement/discord.controller";

const router = Router();

router.get("/discord/callback", discordAuth);

router.get("/discord", (req, res) => {
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
  const BASE_URL = process.env.BASE_URL!; 

  const redirect_uri = `${BASE_URL}/auth/discord/callback`;

  const scope = "identify email";

  const state = req.query.state;

  const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state as string)}`;

  res.redirect(discordUrl);
});

export default router;
