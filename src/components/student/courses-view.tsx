"use client";

import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequireStudent } from "@/components/student/require-student";
import {
  apiFetch,
  getStoredUser,
  type Course,
  type Enrollment,
  type OrderResponse,
  type PaymentConfig,
} from "@/lib/api";
import { cn } from "cn";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  handler: (resp: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Tab = "browse" | "my";

export function CoursesView() {
  const [tab, setTab] = React.useState<Tab>("browse");

  return (
    <RequireStudent title="Courses">
      <div className="grid gap-5">
        <section>
          <h1 className="font-heading text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Browse courses, enroll, and open your learning content.
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          {(["browse", "my"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                tab === t && "border-primary bg-primary/5 text-primary"
              )}
            >
              {t === "browse" ? "Browse" : "My courses"}
            </button>
          ))}
        </div>

        {tab === "browse" ? <BrowsePanel /> : <MyCoursesPanel />}
      </div>
    </RequireStudent>
  );
}

function BrowsePanel() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = React.useState<Set<string>>(new Set());
  const [config, setConfig] = React.useState<PaymentConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const user = getStoredUser();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [c, mine, cfg] = await Promise.all([
        apiFetch<{ courses: Course[] }>("/courses"),
        apiFetch<{ enrollments: Enrollment[] }>("/enrollments/my"),
        apiFetch<PaymentConfig>("/payments/config"),
      ]);
      setCourses(c.courses);
      setEnrolledIds(new Set(mine.enrollments.map((e) => e.courseId)));
      setConfig(cfg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  async function enroll(courseId: string) {
    setBusy(courseId);
    setError("");
    try {
      await apiFetch("/enrollments", { method: "POST", body: { courseId } });
      setEnrolledIds((prev) => new Set(prev).add(courseId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to enroll");
    } finally {
      setBusy(null);
    }
  }

  async function buy(course: Course) {
    setBusy(course.id);
    setError("");
    try {
      if (!config?.configured || !config.keyId) {
        setError("Payments are not configured yet. Please try again later.");
        return;
      }
      const { order } = await apiFetch<OrderResponse>("/payments/order", {
        method: "POST",
        body: { courseId: course.id },
      });
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) {
        setError("Could not load the payment checkout.");
        return;
      }
      const rzp = new window.Razorpay({
        key: config.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "LUCOUS",
        description: course.title,
        order_id: order.id,
        prefill: { name: user?.name, email: user?.email },
        handler: async (resp) => {
          try {
            await apiFetch("/payments/verify", {
              method: "POST",
              body: {
                orderId: resp.razorpay_order_id,
                paymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
              },
            });
            setEnrolledIds((prev) => new Set(prev).add(course.id));
          } catch (e) {
            setError(e instanceof Error ? e.message : "Payment verification failed");
          } finally {
            setBusy(null);
          }
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start payment");
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="pt-1">
            <p className="text-sm text-muted-foreground">No courses available yet.</p>
          </CardContent>
        </Card>
      ) : (
        courses.map((c) => {
          const enrolled = enrolledIds.has(c.id);
          const paid = c.price > 0;
          return (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-base">{c.title}</CardTitle>
                <CardDescription>
                  {c.subject} · {c.board}
                  {c.teacher?.name ? ` · by ${c.teacher.name}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={paid ? "secondary" : "outline"}>
                    {paid ? `₹${(c.price / 100).toFixed(0)}` : "Free"}
                  </Badge>
                  {enrolled ? (
                    <>
                      <Badge variant="secondary">Enrolled</Badge>
                      <Link href="/student/learn" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                        Open learning
                      </Link>
                    </>
                  ) : paid ? (
                    <Button size="sm" onClick={() => void buy(c)} disabled={busy === c.id}>
                      {busy === c.id ? "Processing…" : "Buy & enroll"}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => void enroll(c.id)} disabled={busy === c.id}>
                      {busy === c.id ? "Enrolling…" : "Enroll"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

function MyCoursesPanel() {
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<{ enrollments: Enrollment[] }>("/enrollments/my");
        if (active) setEnrollments(d.enrollments);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load enrollments");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My courses</CardTitle>
        <CardDescription>{enrollments.length} enrolled</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t enrolled in any courses yet.
          </p>
        ) : (
          enrollments.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{e.course?.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.course?.subject} · {e.course?.board}
                  {e.course?.teacher?.name ? ` · ${e.course.teacher.name}` : ""}
                </p>
              </div>
              <Link href="/student/learn" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Learn
              </Link>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
