import { createSignal, createEffect, Show } from 'solid-js';
import { formatCurrency, formatPercent } from '../utils/formatters';
import * as TextField from '@kobalte/core/text-field';
import * as Checkbox from '@kobalte/core/checkbox';
import { debounce } from '@solid-primitives/scheduled';

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = createSignal(300000);
  const [interestRate, setInterestRate] = createSignal(3.5);
  const [loanTerm, setLoanTerm] = createSignal(30);
  const [downPayment, setDownPayment] = createSignal(60000);
  const [propertyTax, setPropertyTax] = createSignal(3000);
  const [homeInsurance, setHomeInsurance] = createSignal(1200);
  const [showAmortization, setShowAmortization] = createSignal(false);

  const [monthlyPayment, setMonthlyPayment] = createSignal(0);
  const [totalInterest, setTotalInterest] = createSignal(0);
  const [totalCost, setTotalCost] = createSignal(0);
  const [amortizationSchedule, setAmortizationSchedule] = createSignal<AmortizationEntry[]>([]);

  const handleNumberInput = (setter: (value: number) => void) => {
    const debouncedSetter = debounce((value: number) => {
      setter(value);
    }, 250);

    return (event: Event) => {
      const value = (event.target as HTMLInputElement).value;
      debouncedSetter(Number(value) || 0);
    };
  };

  createEffect(() => {
    const principal = loanAmount() - downPayment();
    const monthlyRate = interestRate() / 100 / 12;
    const numberOfPayments = loanTerm() * 12;

    const payment =
      (principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalInterestPaid = payment * numberOfPayments - principal;
    const totalCostOfLoan = payment * numberOfPayments + downPayment();

    const schedule: AmortizationEntry[] = [];
    let remainingBalance = principal;

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = payment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }

    setMonthlyPayment(payment);
    setTotalInterest(totalInterestPaid);
    setTotalCost(totalCostOfLoan);
    setAmortizationSchedule(schedule);
  });

  const monthlyTaxesAndInsurance = () => (propertyTax() + homeInsurance()) / 12;
  const totalMonthlyPayment = () => monthlyPayment() + monthlyTaxesAndInsurance();

  return (
    <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl">
          Mortgage <span class="text-blue-600">Calculator</span>
        </h1>
        <p class="mt-4 text-xl text-gray-600">Plan your home purchase with confidence</p>
      </header>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="p-6 sm:p-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Input Form */}
            <div class="lg:col-span-1">
              <div class="space-y-8">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 mb-6">Loan Details</h2>
                  <div class="space-y-6">
                    <TextField.Root>
                      <TextField.Label class="block text-sm font-medium text-gray-700 mb-2">
                        Home Price
                      </TextField.Label>
                      <div class="relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <TextField.Input
                          type="number"
                          value={loanAmount()}
                          onInput={handleNumberInput(setLoanAmount)}
                          class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full pl-7 pr-12 py-3 text-gray-900 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          min={0}
                        />
                      </div>
                    </TextField.Root>

                    <TextField.Root>
                      <TextField.Label class="block text-sm font-medium text-gray-700 mb-2">
                        Down Payment
                      </TextField.Label>
                      <div class="relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <TextField.Input
                          type="number"
                          value={downPayment()}
                          onInput={handleNumberInput(setDownPayment)}
                          class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full pl-7 pr-12 py-3 text-gray-900 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          min={0}
                        />
                      </div>
                    </TextField.Root>

                    <TextField.Root>
                      <TextField.Label class="block text-sm font-medium text-gray-700 mb-2">
                        Interest Rate
                      </TextField.Label>
                      <div class="relative rounded-md shadow-sm">
                        <TextField.Input
                          type="number"
                          value={interestRate()}
                          onInput={handleNumberInput(setInterestRate)}
                          class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full pl-3 pr-12 py-3 text-gray-900 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          min={0}
                          max={100}
                          step={0.1}
                        />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </TextField.Root>

                    <TextField.Root>
                      <TextField.Label class="block text-sm font-medium text-gray-700 mb-2">
                        Loan Term
                      </TextField.Label>
                      <div class="relative rounded-md shadow-sm">
                        <TextField.Input
                          type="number"
                          value={loanTerm()}
                          onInput={handleNumberInput(setLoanTerm)}
                          class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full pl-3 pr-16 py-3 text-gray-900 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          min={1}
                          max={50}
                        />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">years</span>
                        </div>
                      </div>
                    </TextField.Root>
                  </div>
                </div>

                <div>
                  <h2 class="text-lg font-semibold text-gray-900 mb-6">Additional Costs</h2>
                  <div class="space-y-6">
                    <TextField.Root>
                      <TextField.Label class="block text-sm font-medium text-gray-700 mb-2">
                        Annual Property Tax
                      </TextField.Label>
                      <div class="relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <TextField.Input
                          type="number"
                          value={propertyTax()}
                          onInput={handleNumberInput(setPropertyTax)}
                          class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full pl-7 pr-12 py-3 text-gray-900 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          min={0}
                        />
                      </div>
                    </TextField.Root>

                    <TextField.Root>
                      <TextField.Label class="block text-sm font-medium text-gray-700 mb-2">
                        Annual Home Insurance
                      </TextField.Label>
                      <div class="relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <TextField.Input
                          type="number"
                          value={homeInsurance()}
                          onInput={handleNumberInput(setHomeInsurance)}
                          class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full pl-7 pr-12 py-3 text-gray-900 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          min={0}
                        />
                      </div>
                    </TextField.Root>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div class="lg:col-span-2">
              {/* Monthly Payment Card */}
              <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg overflow-hidden mb-6">
                <div class="px-6 py-8">
                  <h2 class="text-xl font-semibold text-white mb-6">Monthly Payment Breakdown</h2>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white/10 rounded-lg p-4">
                      <div class="text-blue-100 text-sm">Principal & Interest</div>
                      <div class="text-white text-2xl font-bold mt-1">{formatCurrency(monthlyPayment())}</div>
                    </div>
                    <div class="bg-white/10 rounded-lg p-4">
                      <div class="text-blue-100 text-sm">Taxes & Insurance</div>
                      <div class="text-white text-2xl font-bold mt-1">{formatCurrency(monthlyTaxesAndInsurance())}</div>
                    </div>
                    <div class="bg-white/10 rounded-lg p-4">
                      <div class="text-blue-100 text-sm">Total Monthly Payment</div>
                      <div class="text-white text-2xl font-bold mt-1">{formatCurrency(totalMonthlyPayment())}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div class="grid grid-cols-2 gap-6 mb-6">
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div class="text-sm text-gray-500">Total Interest</div>
                  <div class="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalInterest())}</div>
                  <div class="text-sm text-gray-500 mt-2">Over the life of the loan</div>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div class="text-sm text-gray-500">Total Cost</div>
                  <div class="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalCost())}</div>
                  <div class="text-sm text-gray-500 mt-2">Including down payment</div>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div class="text-sm text-gray-500">Loan-to-Value Ratio</div>
                  <div class="text-2xl font-bold text-blue-600 mt-1">{formatPercent((loanAmount() - downPayment()) / loanAmount())}</div>
                  <div class="text-sm text-gray-500 mt-2">Lower is better</div>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div class="text-sm text-gray-500">Down Payment</div>
                  <div class="text-2xl font-bold text-purple-600 mt-1">{formatPercent(downPayment() / loanAmount())}</div>
                  <div class="text-sm text-gray-500 mt-2">Of home price</div>
                </div>
              </div>

              {/* Amortization Toggle */}
              <div class="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <Checkbox.Root
                  checked={showAmortization()}
                  onChange={setShowAmortization}
                  class="flex items-center"
                >
                  <Checkbox.Input class="sr-only" />
                  <Checkbox.Control class="w-4 h-4 border border-gray-300 rounded bg-white text-blue-600 focus:ring-2 focus:ring-blue-500" />
                  <Checkbox.Label class="ml-2 text-sm font-medium text-gray-700">
                    Show Amortization Schedule
                  </Checkbox.Label>
                </Checkbox.Root>
              </div>

              {/* Amortization Schedule */}
              <Show when={showAmortization()}>
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-900">Amortization Schedule</h2>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        {amortizationSchedule().map((entry) => (
                          <tr class="hover:bg-gray-50 transition-colors duration-150">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.month}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.payment)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.principal)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.interest)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.remainingBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
