import Link from "next/link";

export default function NotFound() {
  return <section className="section"><div className="container centered not-found"><p className="eyebrow">404 / Path not found</p><h1 className="title">This page is outside the system.</h1><p className="subtitle">The address may be incomplete or the page may have moved.</p><div className="button-row"><Link className="btn btn-primary" href="/">Return home</Link></div></div></section>;
}
