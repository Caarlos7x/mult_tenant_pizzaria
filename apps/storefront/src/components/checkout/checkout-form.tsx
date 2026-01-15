"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type Checkout } from "@pizzaria/validators";
import { Button } from "@/components/ui/button";

interface CheckoutFormProps {
  onSubmit: (data: Checkout) => void;
  isSubmitting: boolean;
}

export function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Checkout>({
    resolver: zodResolver(checkoutSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold">Dados do Cliente</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium">Nome *</label>
            <input
              {...register("customerName")}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-destructive">{errors.customerName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Telefone *</label>
            <input
              {...register("customerPhone")}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
            />
            {errors.customerPhone && (
              <p className="mt-1 text-sm text-destructive">{errors.customerPhone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">E-mail (opcional)</label>
            <input
              type="email"
              {...register("customerEmail")}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
            />
            {errors.customerEmail && (
              <p className="mt-1 text-sm text-destructive">{errors.customerEmail.message}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold">Endereço de Entrega</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Rua *</label>
              <input
                {...register("address.street")}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
              />
              {errors.address?.street && (
                <p className="mt-1 text-sm text-destructive">{errors.address.street.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Número *</label>
              <input
                {...register("address.number")}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
              />
              {errors.address?.number && (
                <p className="mt-1 text-sm text-destructive">{errors.address.number.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Complemento</label>
            <input
              {...register("address.complement")}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Bairro *</label>
            <input
              {...register("address.neighborhood")}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
            />
            {errors.address?.neighborhood && (
              <p className="mt-1 text-sm text-destructive">{errors.address.neighborhood.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Cidade *</label>
              <input
                {...register("address.city")}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
              />
              {errors.address?.city && (
                <p className="mt-1 text-xs sm:text-sm text-destructive">{errors.address.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Estado *</label>
              <input
                {...register("address.state")}
                maxLength={2}
                placeholder="SP"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
              />
              {errors.address?.state && (
                <p className="mt-1 text-xs sm:text-sm text-destructive">{errors.address.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">CEP *</label>
              <input
                {...register("address.zipCode")}
                placeholder="00000-000"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
              />
              {errors.address?.zipCode && (
                <p className="mt-1 text-sm text-destructive">{errors.address.zipCode.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Ponto de referência</label>
            <input
              {...register("address.reference")}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold">Forma de Pagamento</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              {...register("paymentMethod")}
              value="CASH_ON_DELIVERY"
              defaultChecked
            />
            <span>Pagar na entrega</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" {...register("paymentMethod")} value="PIX" />
            <span>PIX</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" {...register("paymentMethod")} value="CREDIT_CARD" />
            <span>Cartão de Crédito</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Cupom de desconto</label>
        <input
          {...register("promotionCode")}
          placeholder="Digite o código"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Observações</label>
        <textarea
          {...register("notes")}
          rows={3}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:text-base"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Processando..." : "Finalizar Pedido"}
      </Button>
    </form>
  );
}

