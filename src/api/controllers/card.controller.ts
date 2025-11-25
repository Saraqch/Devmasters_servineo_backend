import Stripe from "stripe";
import Card from "../../models/card.model";
import User from "../../models/userPayment.model";
import 'dotenv/config';

// Validar que la clave de Stripe existe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('❌ STRIPE_SECRET_KEY no está definida en las variables de entorno');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =========================
// Crear y guardar tarjeta
// =========================
export const createCard = async (req, res) => {
  try {
    const { userId, paymentMethodId, saveCard , cardholderName} = req.body;

    // ⿡ Buscar usuario en MongoDB
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let customerId = user.stripeCustomerId;

    // ⿢ Validar o crear Customer en Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });

      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    } else {

      // Validar que el Customer realmente exista en Stripe
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error) {
        // Si no existe, crear uno nuevo
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        });
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        await user.save();
      }
    }

    // ⿣ Adjuntar PaymentMethod al Customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // ⿤ Guardar como default y registrar en MongoDB si se desea
    if (saveCard) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethod.id },
      });

      const newCard = await Card.create({
        userId,
        stripePaymentMethodId: paymentMethod.id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
        isDefault: true,
        cardholderName,
      });

      return res.json(newCard);
    }

    // ⿥ Retornar mensaje si no se guardó
    res.json({ message: "Tarjeta agregada para pago, no guardada" });

  } catch (error) {
    console.error("Error createCard:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// =========================
// Listar tarjetas de usuario
// =========================
export const listCards = async (req, res) => {
  try {
    const { userId } = req.query;
    const cards = await Card.find({ userId });
    res.json(cards);
  } catch (error) {
    console.error("Error listCards:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};