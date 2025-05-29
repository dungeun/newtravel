"use client";
import { useState } from "react";

export default function SmtpMailTestPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 실제 환경에서는 API route를 통해 서버에서 메일 발송
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/send-smtp-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, html: body }),
      });
      if (res.ok) {
        setResult("메일 발송 성공!");
      } else {
        setResult("메일 발송 실패: " + (await res.text()));
      }
    } catch (err: any) {
      setResult("에러: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">SMTP 메일 테스트</h2>
      <form onSubmit={handleSend} className="space-y-4">
        <input type="email" placeholder="수신자 이메일" value={to} onChange={e => setTo(e.target.value)} className="border rounded px-3 py-2 w-full" required />
        <input type="text" placeholder="제목" value={subject} onChange={e => setSubject(e.target.value)} className="border rounded px-3 py-2 w-full" required />
        <textarea placeholder="본문(HTML 가능)" value={body} onChange={e => setBody(e.target.value)} className="border rounded px-3 py-2 w-full min-h-[120px]" required />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-60" disabled={loading}>{loading ? "발송 중..." : "메일 발송"}</button>
      </form>
      {result && <div className="mt-4 text-center text-sm text-gray-700">{result}</div>}
    </div>
  );
} 