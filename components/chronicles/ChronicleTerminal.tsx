"use client";

import { PixelButton } from "@/components/game-ui/PixelButton";
import { useChronicles } from "@/components/chronicles/ChronicleProvider";
import { todayStamp, type ChronicleDraft } from "@/lib/chronicle-log";
import { formatDate } from "@/lib/cn";
import { padChronicle } from "@/lib/player-state";
import { cueUiSound } from "@/lib/ui-sound";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const fieldClass =
  "w-full border border-cyan/35 bg-void px-3 py-2 font-hud text-sm text-mist outline-none placeholder:text-muted/50 focus:border-lime";

const emptyDraft = (): ChronicleDraft => ({
  title: "",
  date: todayStamp(),
  excerpt: "",
  content: "",
  still: "",
});

export function ChronicleTerminal() {
  const {
    terminalOpen,
    closeTerminal,
    authored,
    saveLog,
    deleteLog,
    editingId,
    openTerminal,
    openFile,
    authorUnlocked,
    signOut,
  } = useChronicles();
  const [draft, setDraft] = useState<ChronicleDraft>(emptyDraft);
  const [mode, setMode] = useState<"list" | "write">("list");
  const [notice, setNotice] = useState("");

  const editing = useMemo(
    () => authored.find((item) => item.id === editingId) ?? null,
    [authored, editingId],
  );

  useEffect(() => {
    if (!terminalOpen || !editing) return;
    setMode("write");
    setDraft({
      id: editing.id,
      title: editing.title,
      date: editing.date,
      excerpt: editing.excerpt,
      content: editing.content,
      still: editing.media[0]?.src ?? "",
    });
  }, [editing, terminalOpen]);

  useEffect(() => {
    if (!terminalOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTerminal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeTerminal, terminalOpen]);

  const onStill = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1_800_000) {
      setNotice("STILL TOO LARGE. KEEP IT UNDER 1.8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({ ...current, still: String(reader.result ?? "") }));
    };
    reader.readAsDataURL(file);
  };

  const publish = () => {
    if (!draft.title.trim() || !draft.excerpt.trim() || !draft.content.trim()) {
      setNotice("TITLE, CARD LINE, AND LOG BODY ARE REQUIRED.");
      return;
    }
    const saved = saveLog(draft);
    cueUiSound("unlock");
    setNotice(`FILE WRITTEN. CHRONICLE ${padChronicle(saved.number)} IS LIVE ON THE HUB.`);
    setDraft(emptyDraft());
    setMode("list");
    openTerminal();
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("log");
    if (flag === "denied") setNotice("THAT GOOGLE ACCOUNT IS NOT THE AUTHOR.");
    if (flag === "unarmed") setNotice("TERMINAL NOT ARMED. ADD GOOGLE KEYS IN .ENV.LOCAL.");
    if (flag) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return (
    <AnimatePresence>
      {terminalOpen ? (
        <motion.div
          className="absolute inset-0 z-[48] flex flex-col p-2 pb-[calc(var(--player-h)+var(--nav-h)+env(safe-area-inset-bottom))] sm:p-3 lg:p-4 lg:pb-[var(--player-h)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="terminal-title"
            className="hud-panel-green flex min-h-0 flex-1 flex-col overflow-hidden"
            initial={{ scale: 0.94, y: 28 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lime/25 px-3 py-3 sm:px-4">
              <div>
                <p className="hud-label text-lime">ROOM 00 // AUTHOR</p>
                <h2 id="terminal-title" className="mt-1 font-display text-lg uppercase text-mist sm:text-xl">
                  CHRONICLE TERMINAL
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {authorUnlocked ? (
                  <>
                    {mode === "write" ? (
                      <PixelButton variant="ghost" onClick={() => { setMode("list"); openTerminal(); }}>
                        FILES
                      </PixelButton>
                    ) : (
                      <PixelButton
                        onClick={() => {
                          setDraft(emptyDraft());
                          setNotice("");
                          setMode("write");
                          openTerminal();
                        }}
                      >
                        WRITE LOG
                      </PixelButton>
                    )}
                    <PixelButton variant="ghost" onClick={() => void signOut()}>
                      SIGN OUT
                    </PixelButton>
                  </>
                ) : null}
                <PixelButton variant="ghost" onClick={closeTerminal}>
                  CLOSE
                </PixelButton>
              </div>
            </div>

            {notice ? (
              <p className="border-b border-lime/20 px-3 py-2 font-hud text-[11px] tracking-[0.12em] text-lime sm:px-4">
                {notice}
              </p>
            ) : null}

            {!authorUnlocked ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
                <p className="hud-label text-lime">LOCKED</p>
                <p className="max-w-sm text-sm leading-7 text-muted">
                  Sign in with the author Google account. Any other Google login stays locked out.
                </p>
                <PixelButton onClick={() => { window.location.href = "/api/admin/google"; }}>
                  CONTINUE WITH GOOGLE
                </PixelButton>
              </div>
            ) : mode === "list" ? (
              <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
                {authored.length === 0 ? (
                  <p className="max-w-md text-sm leading-7 text-muted">
                    No authored files yet. WRITE LOG puts a new chronicle on the Home hub card — number, date, still, and the short line people see before they open the file.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {authored.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 border border-cyan/25 bg-void/60 px-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="hud-label text-cyan">CHRONICLE {padChronicle(item.number)}</p>
                          <p className="mt-1 truncate font-display text-[12px] uppercase text-mist">{item.title}</p>
                          <p className="mt-1 font-hud text-[10px] text-lime">{formatDate(item.date)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <PixelButton variant="ghost" onClick={() => openFile(item.slug)}>
                            OPEN
                          </PixelButton>
                          <PixelButton variant="ghost" onClick={() => openTerminal(item.id)}>
                            EDIT
                          </PixelButton>
                          <PixelButton
                            variant="danger"
                            onClick={() => {
                              deleteLog(item.id);
                              setNotice("FILE DELETED.");
                            }}
                          >
                            DELETE
                          </PixelButton>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <form
                className="min-h-0 flex-1 overflow-auto p-3 sm:p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  publish();
                }}
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="hud-label text-cyan">TITLE</span>
                      <input
                        className={`${fieldClass} mt-2`}
                        value={draft.title}
                        onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                        placeholder="THE WORLD COMES ONLINE"
                      />
                    </label>
                    <label className="block">
                      <span className="hud-label text-cyan">CARD LINE</span>
                      <textarea
                        className={`${fieldClass} mt-2 min-h-20 resize-y`}
                        value={draft.excerpt}
                        onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))}
                        placeholder="The short line on the Home hub card."
                      />
                    </label>
                    <label className="block">
                      <span className="hud-label text-cyan">LOG BODY</span>
                      <textarea
                        className={`${fieldClass} mt-2 min-h-48 resize-y leading-7`}
                        value={draft.content}
                        onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
                        placeholder="The full file. Paragraphs separated by a blank line."
                      />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="hud-label text-cyan">DATE</span>
                      <input
                        type="date"
                        className={`${fieldClass} mt-2`}
                        value={draft.date}
                        onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                      />
                    </label>
                    <label className="block">
                      <span className="hud-label text-cyan">STILL URL</span>
                      <input
                        className={`${fieldClass} mt-2`}
                        value={draft.still?.startsWith("data:") ? "" : draft.still}
                        onChange={(event) => setDraft((current) => ({ ...current, still: event.target.value }))}
                        placeholder="/art/chronicle-boot.svg"
                      />
                    </label>
                    <label className="block">
                      <span className="hud-label text-cyan">OR UPLOAD STILL</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="mt-2 w-full font-hud text-[11px] text-muted file:mr-3 file:border file:border-cyan/40 file:bg-navy file:px-3 file:py-1 file:font-hud file:text-[10px] file:text-cyan"
                        onChange={(event) => onStill(event.target.files?.[0])}
                      />
                    </label>
                    {draft.still ? (
                      <div className="cover-frame overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={draft.still} alt="" className="aspect-video w-full object-cover" />
                      </div>
                    ) : null}
                    <PixelButton type="submit" className="w-full">
                      {draft.id ? "SAVE FILE" : "PUBLISH TO HUB"}
                    </PixelButton>
                  </div>
                </div>
              </form>
            )}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
