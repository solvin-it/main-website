import Link from "next/link";

export default function NotFound() {
  return <section className="section"><div className="container" style={{ textAlign: "center", paddingBlock: "8rem" }}><p className="eyebrow">404 / Path not found</p><h1 className="title">This workflow leads somewhere else.</h1><p className="subtitle" style={{ marginInline: "auto" }}>The page may have moved or the address may be incomplete.</p><div className="button-row" style={{ justifyContent: "center" }}><Link className="btn btn-primary" href="/">Return home</Link></div></div></section>;
}
