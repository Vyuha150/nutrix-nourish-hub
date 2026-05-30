import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/nutrix/Layout";
import { PageHero } from "@/components/nutrix/PageHero";
import { Download, ShieldCheck, QrCode, Search } from "lucide-react";
import hero from "@/assets/cat-capsules.jpg";
import { useCommerce } from "@/components/nutrix/CommerceProvider";
import { buildApiUrl } from "@/lib/api";

const LabReports = () => {
  const { labReports } = useCommerce();
  const [q, setQ] = useState("");
  useEffect(() => { document.title = "Lab Reports · Nutrix"; }, []);
  const list = useMemo(() => labReports.filter((report) => (report.productName + report.lotNumber).toLowerCase().includes(q.toLowerCase())), [labReports, q]);

  const getDownloadHref = (report: (typeof labReports)[number]) => {
    if (report.reportDownloadUrl) {
      return buildApiUrl(report.reportDownloadUrl);
    }

    if (report.reportFileData) {
      return `data:${report.reportFileType || "application/pdf"};base64,${report.reportFileData}`;
    }

    if (report.reportUrl) {
      return report.reportUrl;
    }

    return "";
  };
  return (
    <Layout>
      <PageHero
        eyebrow="Open by default"
        title={<>Receipts, not <em className="font-light">promises.</em></>}
        sub="Every Nutrix lot is independently assayed. Browse the public archive, or scan your bottle's QR to pull the exact certificate for the batch in your hand."
        image={hero}
      />

      <section className="py-16 bg-background">
        <div className="container-tight">
          <div className="grid md:grid-cols-3 gap-5 mb-12">
            {[
              { icon: ShieldCheck, t: "ISO-17025 labs", d: "Independent, accredited testing — never our own labs." },
              { icon: QrCode, t: "QR on every pack", d: "Scan to surface the certificate for the exact lot you bought." },
              { icon: Download, t: "Always downloadable", d: "PDFs hosted in perpetuity. Auditable forever." },
            ].map((c, i) => (
              <div key={c.t} className="rounded-2xl bg-card border border-border p-6 shadow-soft animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="w-11 h-11 rounded-xl bg-gradient-leaf flex items-center justify-center"><c.icon className="w-5 h-5 text-primary" /></div>
                <h3 className="font-serif text-lg text-primary mt-4">{c.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
              </div>
            ))}
          </div>

          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by product or lot number…"
              className="w-full h-11 rounded-full bg-dew text-primary placeholder:text-muted-foreground pl-11 pr-5 text-sm outline-none focus:ring-2 focus:ring-leaf"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4 hidden md:table-cell">Lot</th>
                  <th className="text-left p-4 hidden lg:table-cell">Date</th>
                  <th className="text-left p-4 hidden md:table-cell">Lab</th>
                  <th className="text-left p-4">Potency</th>
                  <th className="text-left p-4 hidden lg:table-cell">Metals</th>
                  <th className="text-left p-4 hidden lg:table-cell">Micro</th>
                  <th className="text-left p-4">CoA</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r, i) => (
                  <tr key={r.id} className={`border-t border-border hover:bg-dew/40 transition-colors animate-fade-up`} style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="p-4 font-serif text-primary">{r.productName}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground font-mono text-xs">{r.lotNumber}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{r.testedOn}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{r.labName}</td>
                    <td className="p-4 text-leaf font-semibold">{r.potency}</td>
                    <td className="p-4 hidden lg:table-cell"><span className="px-2 py-0.5 rounded-full bg-leaf/20 text-forest text-[10px] font-semibold">{r.metals}</span></td>
                    <td className="p-4 hidden lg:table-cell"><span className="px-2 py-0.5 rounded-full bg-leaf/20 text-forest text-[10px] font-semibold">{r.micro}</span></td>
                    <td className="p-4">
                      {getDownloadHref(r) ? (
                        <a
                          href={getDownloadHref(r)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-leaf transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LabReports;
