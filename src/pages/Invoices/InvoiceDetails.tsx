import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Download, CheckCircle, Printer, Loader2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './InvoiceDetails.css';

export const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);


  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    const { data: inv, error: invError } = await supabase
      .from('invoices')
      .select('*, clients(*), profiles(*)')
      .eq('id', id)
      .single();

    if (invError) {
      console.error(invError);
      return;
    }

    const { data: itms } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);

    setInvoice(inv);
    setItems(itms || []);
    setLoading(false);
  };

  const handleMarkPaid = async () => {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', id);

    if (!error) {
      // Generate receipt
      await supabase.from('receipts').insert([{ invoice_id: id }]);
      fetchInvoiceDetails();
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice-paper');
    if (!element) return;
    
    setExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const filename = showReceipt ? `receipt-${invoice.invoice_number}` : `invoice-${invoice.invoice_number}`;
      pdf.save(`${filename}.pdf`);

    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="loading">Loading invoice...</div>;
  if (!invoice) return <div>Invoice not found.</div>;

  return (
    <div className="invoice-details-page">
      <div className="details-header">
        <button className="btn-text" onClick={() => navigate('/invoices')}>
          <ArrowLeft size={20} />
          <span>Back to Invoices</span>
        </button>
        <div className="header-actions">
          {invoice.status === 'paid' && (
            <button 
              className={`btn-secondary ${showReceipt ? 'active' : ''}`} 
              onClick={() => setShowReceipt(!showReceipt)}
            >
              <FileText size={18} />
              <span>{showReceipt ? 'View Invoice' : 'View Receipt'}</span>
            </button>
          )}
          <button className="btn-secondary">
            <Printer size={18} />
            <span>Print</span>
          </button>
          <button className="btn-secondary" onClick={handleDownloadPDF} disabled={exporting}>
            {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span>{exporting ? 'Generating...' : `Download ${showReceipt ? 'Receipt' : 'PDF'}`}</span>
          </button>
          {invoice.status !== 'paid' && (
            <button className="btn btn-primary" onClick={handleMarkPaid}>
              <CheckCircle size={18} />
              <span>Mark as Paid</span>
            </button>
          )}
        </div>
      </div>

      <div className={`invoice-paper glass ${showReceipt ? 'is-receipt' : ''}`} id="invoice-paper">
        {showReceipt && <div className="receipt-watermark">PAID</div>}
        <div className="paper-header">
          <div className="business-info" style={{ maxWidth: '60%' }}>
            {invoice.profiles?.business_name && <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', color: '#0f172a' }}>{invoice.profiles.business_name}</h2>}
            {invoice.profiles?.email && <p style={{ margin: '2px 0', color: '#64748b', fontSize: '0.875rem' }}>{invoice.profiles.email}</p>}
            {invoice.profiles?.phone && <p style={{ margin: '2px 0', color: '#64748b', fontSize: '0.875rem' }}>{invoice.profiles.phone}</p>}
            {invoice.profiles?.address && <p style={{ margin: '2px 0', color: '#64748b', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{invoice.profiles.address}</p>}
            {invoice.profiles?.website && <p style={{ margin: '2px 0', color: '#64748b', fontSize: '0.875rem' }}>{invoice.profiles.website}</p>}
          </div>
          <div className="invoice-meta">
            <h1>{showReceipt ? 'RECEIPT' : 'INVOICE'}</h1>
            <p>#{invoice.invoice_number}</p>
          </div>
        </div>


        <div className="paper-info">
          <div className="info-block">
            <label>Billed To</label>
            <h3>{invoice.clients?.name}</h3>
            <p>{invoice.clients?.street_address}</p>
            <p>{invoice.clients?.email}</p>
          </div>
          <div className="info-block right">
            <div className="meta-row">
              <label>Issue Date:</label>
              <span>{new Date(invoice.issue_date).toLocaleDateString()}</span>
            </div>
            <div className="meta-row">
              <label>Due Date:</label>
              <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
            </div>
            <div className="meta-row">
              <label>Status:</label>
              <span className={`status-badge status-${invoice.status}`}>{invoice.status}</span>
            </div>
          </div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>₦{item.rate.toLocaleString()}</td>
                <td>₦{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="paper-footer">
          <div className="footer-notes">
            <label>Notes</label>
            <p>Thank you for your business. Please make payment to the account details provided below.</p>
          </div>
          <div className="footer-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₦{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>VAT (7.5%)</span>
              <span>₦{invoice.tax.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>₦{invoice.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
