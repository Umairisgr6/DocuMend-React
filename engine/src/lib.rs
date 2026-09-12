//! ODIE — DocuMend's Offline Document Integrity Engine.
//!
//! The whole engine is one function: give it the plain text of a document, get
//! back a JSON report of the problems found and where they are. It never talks
//! to the network, never keeps state between calls, and runs inside a Web
//! Worker so typing stays smooth.
//!
//!   let report = documend_engine::analyze_to_json("…the document…");
//!
//! All positions in the report are UTF-16 offsets — the same numbers
//! JavaScript uses — so the editor can highlight the exact words.
//!
//! Build for the browser:
//!   wasm-pack build engine --target web --out-dir ../src/engine/pkg
//! Run the tests (no internet needed):
//!   cargo test --manifest-path engine/Cargo.toml

pub mod json;
pub mod numbers;
pub mod rules;
pub mod text;

use rules::Issue;

pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// What the engine measured while it worked.
#[derive(Debug, Clone, PartialEq)]
pub struct Stats {
    pub sentences: usize,
    pub words: usize,
    pub numbers: usize,
    pub checks: usize,
}

/// The result of one analysis.
#[derive(Debug, Clone, PartialEq)]
pub struct Report {
    pub issues: Vec<Issue>,
    pub stats: Stats,
}

/// Reads a document and reports what is wrong with it.
pub fn analyze(document: &str) -> Report {
    let sentences = text::split_sentences(document);
    let numbers = sentences
        .iter()
        .map(|sentence| numbers::numbers_in(sentence).len())
        .sum();
    let issues = rules::run(&sentences);
    Report {
        stats: Stats {
            sentences: sentences.len(),
            words: text::words(document).len(),
            numbers,
            checks: 3,
        },
        issues,
    }
}

/// The same as [`analyze`], as the JSON the browser reads.
pub fn analyze_to_json(document: &str) -> String {
    report_to_json(&analyze(document))
}

fn report_to_json(report: &Report) -> String {
    let issues: Vec<String> = report.issues.iter().map(issue_to_json).collect();
    json::object(&[
        ("version", json::quote(VERSION)),
        ("issues", json::array(&issues)),
        (
            "stats",
            json::object(&[
                ("sentences", json::number(report.stats.sentences as f64)),
                ("words", json::number(report.stats.words as f64)),
                ("numbers", json::number(report.stats.numbers as f64)),
                ("checks", json::number(report.stats.checks as f64)),
            ]),
        ),
    ])
}

fn issue_to_json(issue: &Issue) -> String {
    let related: Vec<String> = issue
        .related
        .iter()
        .map(|span| {
            json::object(&[
                ("start", json::number(span.start as f64)),
                ("end", json::number(span.end as f64)),
            ])
        })
        .collect();
    let repairs: Vec<String> = issue
        .repairs
        .iter()
        .map(|repair| {
            json::object(&[
                ("label", json::quote(&repair.label)),
                ("start", json::number(repair.start as f64)),
                ("end", json::number(repair.end as f64)),
                ("text", json::quote(&repair.text)),
            ])
        })
        .collect();
    json::object(&[
        ("id", json::quote(&issue.id)),
        ("kind", json::quote(&issue.kind)),
        ("title", json::quote(&issue.title)),
        ("message", json::quote(&issue.message)),
        ("severity", json::quote(&issue.severity)),
        ("location", json::quote(&issue.location)),
        ("start", json::number(issue.start as f64)),
        ("end", json::number(issue.end as f64)),
        ("related", json::array(&related)),
        ("repairs", json::array(&repairs)),
    ])
}

/* ---------------------------------------------------------------------------
   The browser build. wasm-bindgen is only compiled for WebAssembly, so
   `cargo test` on a laptop needs no dependencies at all.
   ------------------------------------------------------------------------- */
#[cfg(target_arch = "wasm32")]
mod browser {
    use wasm_bindgen::prelude::*;

    /// Analyses a document and returns the report as a JSON string.
    #[wasm_bindgen]
    pub fn analyze_json(document: &str) -> String {
        super::analyze_to_json(document)
    }

    /// The engine's version, shown in the editor's status bar.
    #[wasm_bindgen]
    pub fn engine_version() -> String {
        super::VERSION.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_document_is_clean() {
        let report = analyze("");
        assert_eq!(report.stats.sentences, 0);
        assert!(report.issues.is_empty());
    }

    #[test]
    fn counts_what_it_read() {
        let report = analyze("The lab budget is PKR 45,000. The team has 8 members.");
        assert_eq!(report.stats.sentences, 2);
        assert_eq!(report.stats.numbers, 2);
        assert_eq!(report.stats.checks, 3);
    }

    #[test]
    fn json_has_the_fields_the_editor_reads() {
        let out = analyze_to_json(
            "The project budget is PKR 45,000 for lab equipment. \
             The lab equipment budget is PKR 32,000.",
        );
        assert!(out.starts_with("{\"version\":"));
        assert!(out.contains("\"kind\":\"contradiction\""));
        assert!(out.contains("\"repairs\":[{\"label\":"));
        assert!(out.contains("\"stats\":{\"sentences\":2"));
    }

    #[test]
    fn quotes_inside_the_document_do_not_break_the_json() {
        let out = analyze_to_json(
            "He said \"the budget is PKR 45,000\" for lab equipment. \
             The lab equipment budget is PKR 32,000.",
        );
        // The conflict is still found, and every quote in the output is a JSON
        // quote — an unescaped one from the document would make the count odd.
        assert!(out.contains("\"kind\":\"contradiction\""));
        assert_eq!(out.matches('"').count() % 2, 0);
    }
}
