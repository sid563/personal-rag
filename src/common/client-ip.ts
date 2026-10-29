type ReqLike = {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
};

/** Client address behind Vercel's or any proxy's forwarding headers. */
export function clientIp(req: ReqLike): string {
  const header = (name: string) => {
    const v = req.headers[name];
    return Array.isArray(v) ? v[0] : v;
  };
  const forwarded = header('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return header('x-real-ip') || req.ip || req.socket?.remoteAddress || 'unknown';
}
