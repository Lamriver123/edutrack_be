export const RECEIPT_TEMPLATE_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,700;0,800;0,900;1,400;1,700&display=swap');
    @page {
      size: A4;
      margin: 0;
    }
    * { box-sizing: border-box; }
    html {
      background: #eef2ff;
    }
    body {
      margin: 0;
      background: #eef2ff;
      color: #1f1646;
      font-family: "Be Vietnam Pro", Arial, "DejaVu Sans", "Liberation Sans", Tahoma, sans-serif;
      font-size: 13px;
      line-height: 1.45;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #d7e2ff;
      padding: 18px 20px 16px;
    }
    .top {
      position: relative;
      text-align: center;
      padding: 0 72px 10px;
      border-bottom: 3px solid #fee2a8;
    }
    .sticker {
      position: absolute;
      top: 6px;
      width: 52px;
      height: 52px;
      border-radius: 16px 18px 14px 20px;
      object-fit: contain;
      box-shadow: 0 10px 22px rgba(245, 158, 11, 0.18);
    }
    .sticker.right {
      right: 14px;
      transform: rotate(12deg);
    }
    .sticker.left {
      left: 14px;
      transform: rotate(-10deg);
    }
    .brand-line {
      color: #6b3b1d;
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0;
    }
    h1 {
      margin: 4px 0 0;
      color: #ff7b35;
      font-size: 25px;
      font-weight: 900;
      letter-spacing: 0;
    }
    .info-strip {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 8px 0 6px;
      border-radius: 10px;
      background: #fffbea;
      padding: 8px 10px;
    }
    .info-pill {
      display: flex;
      min-width: 0;
      align-items: center;
      gap: 8px;
      color: #533421;
      font-weight: 900;
    }
    .info-icon {
      display: grid;
      width: 28px;
      height: 28px;
      flex: 0 0 28px;
      place-items: center;
      border-radius: 999px;
      background: #c7f9ed;
      color: #08796c;
    }
    .info-icon svg, .info-icon img {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2.2;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .info-pill span:last-child {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .meta-line {
      display: flex;
      justify-content: center;
      gap: 14px;
      color: #6b7280;
      font-size: 11px;
      font-weight: 800;
    }
    .section {
      margin-top: 14px;
    }
    .section-label {
      display: inline-flex;
      min-height: 24px;
      align-items: center;
      border-radius: 999px 999px 999px 4px;
      background: linear-gradient(135deg, #4d7ef8, #355edb);
      color: #ffffff;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .section-label.green {
      background: linear-gradient(135deg, #6cb8a6, #328779);
    }
    .section-label.orange {
      background: linear-gradient(135deg, #ffb25c, #ff7b35);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    th, td {
      border: 2px solid #9db2ff;
      padding: 8px 7px;
      vertical-align: middle;
    }
    th {
      background: #ced8ff;
      color: #1f1646;
      font-size: 12px;
      font-weight: 900;
      text-align: center;
    }
    td {
      background: #ffffff;
      color: #312a55;
      font-size: 12px;
      font-weight: 700;
    }
    .center { text-align: center; }
    .muted { color: #64748b; }
    .lesson-index {
      background: #ff8a3d;
      color: #ffffff;
      font-weight: 900;
      padding: 6px 3px;
      text-align: center;
    }
    .lesson-index-value {
      display: block;
      font-size: 13px;
      line-height: 1.1;
    }
    .lesson-index-kind {
      display: inline-block;
      margin-top: 4px;
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.92);
      padding: 1px 3px;
      color: #9f1239;
      font-size: 8px;
      font-weight: 900;
      line-height: 1.15;
      white-space: nowrap;
    }
    .lesson-class {
      display: inline-block;
      margin-bottom: 3px;
      border-radius: 999px;
      background: #eef2ff;
      padding: 2px 7px;
      color: #4338ca;
      font-size: 10px;
      font-weight: 900;
    }
    .exam-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-top: 6px;
    }
    .exam-grid.single {
      grid-template-columns: 1fr;
    }
    .comment-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 7px;
    }
    .comment-card {
      display: grid;
      grid-template-rows: auto 1fr;
      min-height: 116px;
      border: 1.8px solid #f6d36b;
      border-radius: 12px;
      background: #ffffff;
      padding: 8px;
      color: #1f2937;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      white-space: pre-line;
    }
    .comment-card h3 {
      margin: 0;
      border-radius: 8px;
      background: #fff4c6;
      padding: 7px 8px;
      color: #7c3f15;
      font-size: 12px;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
    }
    .comment-body {
      display: grid;
      min-height: 68px;
      place-items: center;
      margin-top: 8px;
      border-radius: 8px;
      background: #fffdf2;
      padding: 8px;
      line-height: 1.5;
    }
    .payment-grid {
      display: grid;
      grid-template-columns: 190px 1fr 170px;
      gap: 10px;
      align-items: stretch;
      margin-top: 7px;
    }
    .payment-card {
      border: 1.8px solid #fde68a;
      border-radius: 10px;
      background: #fffdf2;
      padding: 10px;
    }
    .payment-card h3 {
      margin: 0 0 8px;
      color: #7c3f15;
      font-size: 12px;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
    }
    .amount {
      display: grid;
      min-height: 76px;
      place-items: center;
      border-radius: 8px;
      background: #fff7d6;
      color: #1f1646;
      text-align: center;
    }
    .amount strong {
      display: block;
      margin: 3px 0;
      font-size: 20px;
      font-weight: 900;
    }
    .price-note {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 145px 1fr;
      gap: 8px;
      align-items: stretch;
      border: 1.8px dashed #f0cf71;
      border-radius: 10px;
      background: #fffaf0;
      padding: 8px;
      color: #7c3f15;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.35;
    }
    .price-note-title {
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: #fff1bf;
      padding: 7px;
      text-align: center;
      text-transform: uppercase;
    }
    .price-note-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 6px;
    }
    .price-note-row {
      display: flex;
      min-width: 0;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      border-radius: 8px;
      background: #ffffff;
      padding: 6px 8px;
    }
    .price-note-row span {
      min-width: 0;
      color: #6b3b1d;
    }
    .price-note-row strong {
      flex: 0 0 auto;
      color: #1f1646;
      font-weight: 900;
      white-space: nowrap;
    }
    .payment-line {
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: 8px;
      border-bottom: 1px solid #f3e8bf;
      padding: 5px 0;
      font-size: 12px;
      font-weight: 800;
    }
    .payment-line:last-child { border-bottom: 0; }
    .payment-bank-line { align-items: center; }
    .payment-bank-value {
      display: flex;
      min-width: 0;
      align-items: center;
      gap: 7px;
    }
    .payment-bank-value span { min-width: 0; }
    .bank-logo {
      width: 50px;
      height: 50px;
      flex: 0 0 50px;
      object-fit: contain;
    }
    .qr {
      display: grid;
      height: 132px;
      place-items: center;
      border: 1.8px dashed #93c5fd;
      border-radius: 10px;
      background: #f8fbff;
      color: #64748b;
      font-weight: 900;
      text-align: center;
    }
    .qr img {
      width: 124px;
      height: 124px;
      object-fit: contain;
    }
    .footer {
      margin-top: 10px;
      border-radius: 10px;
      background: linear-gradient(90deg, #eef7ff, #fff8dd);
      padding: 9px;
      color: #1d5f9f;
      text-align: center;
      font-size: 13px;
      font-weight: 900;
    }
    .footer span {
      display: block;
    }
    .motto {
      margin-top: 4px;
      color: #4f9f94;
      font-size: 22px;
      font-weight: 900;
      text-align: center;
    }
  `;
