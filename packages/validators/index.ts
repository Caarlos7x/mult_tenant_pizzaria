import { z } from "zod";

// ============================================
// CARRINHO
// ============================================

export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  variantIds: z.array(z.string()).optional(),
  modifierOptionIds: z.array(z.string()).optional(),
  composition: z
    .object({
      type: z.enum(["FULL", "HALF_HALF"]),
      left: z
        .object({
          flavor: z.string(),
          extras: z.array(z.string()).optional(),
        })
        .optional(),
      right: z
        .object({
          flavor: z.string(),
          extras: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
});

// ============================================
// CHECKOUT
// ============================================

export const addressSchema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/),
  reference: z.string().optional(),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(10),
  customerEmail: z.string().email().optional(),
  address: addressSchema,
  paymentMethod: z.enum(["ONLINE", "CASH_ON_DELIVERY", "PIX", "CREDIT_CARD", "DEBIT_CARD"]),
  promotionCode: z.string().optional(),
  notes: z.string().optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Checkout = z.infer<typeof checkoutSchema>;

