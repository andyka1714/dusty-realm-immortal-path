import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Download, Upload, X } from "lucide-react";
import { RootState, store } from "../../store/store";
import { migratePersistedState, PersistedState } from "../../store/persistedStateMigration";
import { saveState, serializeSaveState } from "../../store/localStorage";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const SaveRecoveryBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("目前進度可能尚未保存。");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const show = () => {
      setMessage("目前進度可能尚未保存，請重試或先匯出存檔。");
      setVisible(true);
    };
    window.addEventListener("dusty-realm-save-error", show);
    return () => window.removeEventListener("dusty-realm-save-error", show);
  }, []);

  const exportSave = () => {
    const state = store.getState() as RootState;
    const blob = new Blob([serializeSaveState(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dusty-realm-save-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importSave = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as PersistedState;
      const hydrated = migratePersistedState(parsed);
      if (!saveState(hydrated)) throw new Error("save failed");
      window.location.reload();
    } catch {
      setMessage("匯入失敗：檔案格式不合法或無法通過存檔檢查。");
      setVisible(true);
    }
  };

  if (!visible) return null;
  return (
    <div
      className="fixed inset-x-3 bottom-24 z-[4000] mx-auto flex max-w-xl items-center gap-3 rounded-xl border border-amber-500/40 bg-stone-950/95 px-3 py-2 text-xs text-amber-100 shadow-2xl backdrop-blur-xl md:bottom-4"
      role="alert"
      data-testid="save-recovery-banner"
    >
      <AlertTriangle className="shrink-0 text-amber-400" size={16} />
      <span className="min-w-0 flex-1">{message}</span>
      <Button type="button" size="sm" variant="amber" onClick={exportSave} data-testid="save-export-button">
        <Download size={14} /> 匯出
      </Button>
      <Button type="button" size="sm" variant="stone" onClick={() => inputRef.current?.click()} data-testid="save-import-button">
        <Upload size={14} /> 匯入
      </Button>
      <Button type="button" variant="ghost" size="icon" aria-label="關閉存檔提示" className="h-8 w-8 text-stone-500 hover:text-stone-200" onClick={() => setVisible(false)}>
        <X size={14} />
      </Button>
      <Input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={importSave} />
    </div>
  );
};
