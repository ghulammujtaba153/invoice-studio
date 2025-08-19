"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    features: "",
    price: "",
    stripePriceId: "",
    requests: "",
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:9002/api/plans/get");
      if (Array.isArray(res.data)) {
        setPlans(res.data);
      } else {
        toast.error("Unexpected data format");
      }
    } catch (err) {
      toast.error("Failed to fetch plans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      features: form.features.split(",").map((f) => f.trim()),
      price: parseFloat(form.price),
      stripePriceId: form.stripePriceId,
      requests: parseInt(form.requests),
    };

    try {
      const res = await axios.post("http://localhost:9002/api/plans/create", payload);
      if (res.data?.success) {
        toast.success("Plan created successfully");
        fetchPlans();
        setOpen(false);
        setForm({ title: "", subtitle: "", features: "", price: "", stripePriceId: "", requests: "" });
      } else {
        toast.error(res.data?.message || "Creation failed");
      }
    } catch (error) {
      toast.error("API error");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Subscription Plans</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Plan</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create a Plan</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border" />
              <Input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="border" />
              <Textarea placeholder="Features (comma-separated)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="border" />
              <Input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border" />
              <Input placeholder="Stripe Price ID" value={form.stripePriceId} onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })} className="border" />
              <Input type="number" placeholder="Request Limit" value={form.requests} onChange={(e) => setForm({ ...form, requests: e.target.value })} className="border" />
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePlan}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : plans.length === 0 ? (
        <p>No plans found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={plan._id}
              className="border border-border bg-white dark:bg-card rounded-xl p-6 shadow-md hover:shadow-xl transition duration-300"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-primary">{plan.title}</h3>
                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
              </div>
              <div className="text-3xl font-bold mb-2 text-foreground">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
              </div>
              <p className="text-muted-foreground text-sm mb-2">One-Time Payment</p>
              <hr className="mb-4" />
              <ul className="text-muted-foreground text-sm space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
