import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Transaction } from '../types';

interface GeneratePDFParams {
  businessName: string;
  ownerName: string;
  currency: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactions: Transaction[];
}

export const generateFinancialStatementPDF = async ({
  businessName,
  ownerName,
  currency,
  totalIncome,
  totalExpenses,
  netBalance,
  transactions,
}: GeneratePDFParams): Promise<void> => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const tableRowsHtml = transactions
    .map((tx, index) => {
      const isIncome = tx.type === 'income';
      const isCredit = tx.isCredit;
      const typeColor = isCredit ? '#D97706' : isIncome ? '#10B981' : '#EF4444';
      const typeLabel = isCredit ? 'CREDIT' : isIncome ? 'INFLOW' : 'OUTFLOW';
      const amountSign = isIncome ? '+' : '-';
      const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';

      return `
        <tr style="background-color: ${rowBg}; border-bottom: 1px solid #E5E7EB;">
          <td style="padding: 10px 12px; font-size: 12px; color: #111827;">
            <div style="font-weight: 600;">${tx.description}</div>
            <div style="font-size: 10px; color: #6B7280; margin-top: 2px;">${tx.date} • ${tx.time}</div>
          </td>
          <td style="padding: 10px 12px; font-size: 11px; text-align: center;">
            <span style="background-color: ${typeColor}15; color: ${typeColor}; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 10px;">
              ${typeLabel}
            </span>
          </td>
          <td style="padding: 10px 12px; font-size: 12px; color: #6B7280;">${tx.category}</td>
          <td style="padding: 10px 12px; font-size: 13px; font-weight: 700; color: ${typeColor}; text-align: right;">
            ${amountSign}${currency} ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Financial Statement - ${businessName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 32px;
            color: #111827;
            background-color: #FFFFFF;
          }
          .header-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #10B981;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand-title {
            font-size: 24px;
            font-weight: 800;
            color: #111827;
            margin: 0;
          }
          .brand-sub {
            font-size: 12px;
            color: #6B7280;
            margin-top: 4px;
          }
          .report-tag {
            background-color: #ECFDF5;
            color: #10B981;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
          }
          .metrics-grid {
            display: flex;
            gap: 16px;
            margin-bottom: 28px;
          }
          .metric-card {
            flex: 1;
            background-color: #F8FAFC;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 14px;
          }
          .metric-label {
            font-size: 11px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .metric-value {
            font-size: 18px;
            font-weight: 800;
          }
          .table-container {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th {
            background-color: #F1F5F9;
            color: #4B5563;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 10px 12px;
            text-align: left;
            border-bottom: 2px solid #E5E7EB;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            font-size: 11px;
            color: #9CA3AF;
          }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <div>
            <h1 class="brand-title">${businessName}</h1>
            <div class="brand-sub">Owner: ${ownerName || 'Management'} • Statement Date: ${currentDate}</div>
          </div>
          <div class="report-tag">OFFICIAL POS LEDGER STATEMENT</div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Total Inflow (Income)</div>
            <div class="metric-value" style="color: #10B981;">+${currency} ${totalIncome.toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Outflow (Expenses)</div>
            <div class="metric-value" style="color: #EF4444;">-${currency} ${totalExpenses.toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Net Balance</div>
            <div class="metric-value" style="color: ${netBalance >= 0 ? '#10B981' : '#EF4444'};">
              ${currency} ${netBalance.toLocaleString()}
            </div>
          </div>
        </div>

        <h3 style="font-size: 15px; margin-bottom: 12px; color: #111827;">Transaction Ledger (${transactions.length} entries)</h3>

        <table class="table-container">
          <thead>
            <tr>
              <th style="width: 40%;">Description & Date</th>
              <th style="width: 15%; text-align: center;">Type</th>
              <th style="width: 20%;">Category</th>
              <th style="width: 25%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by ${businessName} POS • Powered by Retail POS System
        </div>
      </body>
    </html>
  `;

  try {
    // 1. Render HTML string into temporary PDF file
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // 2. Open native OS share sheet (WhatsApp, Files, Print, Mail)
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `${businessName} Financial Statement PDF`,
      });
    }
  } catch (error) {
    console.error('Failed to generate PDF statement', error);
    throw error;
  }
};
