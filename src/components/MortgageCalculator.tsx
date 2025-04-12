import { createSignal, createEffect } from 'solid-js';

export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = createSignal(300000);
  const [interestRate, setInterestRate] = createSignal(3.5);
  const [loanTerm, setLoanTerm] = createSignal(30);
  const [monthlyPayment, setMonthlyPayment] = createSignal(0);

  createEffect(() => {
    const principal = loanAmount();
    const monthlyRate = interestRate() / 100 / 12;
    const numberOfPayments = loanTerm() * 12;

    const payment =
      (principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    setMonthlyPayment(payment);
  });

  return (
    <div class="max-w-2xl mx-auto p-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-6">Mortgage Calculator</h2>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Loan Amount ($)</span>
            </label>
            <input
              type="number"
              class="input input-bordered"
              value={loanAmount()}
              onInput={(e) => setLoanAmount(Number(e.currentTarget.value))}
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Interest Rate (%)</span>
            </label>
            <input
              type="number"
              step="0.1"
              class="input input-bordered"
              value={interestRate()}
              onInput={(e) => setInterestRate(Number(e.currentTarget.value))}
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Loan Term (years)</span>
            </label>
            <input
              type="number"
              class="input input-bordered"
              value={loanTerm()}
              onInput={(e) => setLoanTerm(Number(e.currentTarget.value))}
            />
          </div>

          <div class="mt-6 p-4 bg-base-200 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Monthly Payment</h3>
            <p class="text-3xl font-bold text-primary">
              ${monthlyPayment().toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
