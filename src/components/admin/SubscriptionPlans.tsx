"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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
      setPlans(res.data?.plans || []);
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
        toast.error(res.data?.message || "Failed to create plan");
      }
    } catch (error) {
      toast.error("API error during creation");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Subscription Plans</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create New Plan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Plan</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <Input
              className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
              className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none"
                placeholder="Subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
              <Textarea
                placeholder="Comma-separated features (e.g. 100 requests,Email support)"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
              />
              <Input
              className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <Input
              className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none"
                placeholder="Stripe Price ID"
                value={form.stripePriceId}
                onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })}
              />
              <Input
              className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none"
                type="number"
                placeholder="Request Limit"
                value={form.requests}
                onChange={(e) => setForm({ ...form, requests: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button onClick={handleCreatePlan}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((card, index) => (
            <div
              key={card.id || index}
              onClick={() => setActiveIndex(index)}
              className={`flex flex-col gap-4 border ${
                activeIndex === index
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-border"
              } bg-card backdrop-blur-[70px] rounded-[20px] p-4 transition-all duration-300 cursor-pointer hover:scale-[1.02]`}
            >
              <div className="flex flex-col gap-2">
                <h1 className={`text-2xl font-bold ${activeIndex === index ? "text-primary" : "text-foreground"}`}>{card.title}</h1>
                <p className="text-muted-foreground text-sm">{card.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-foreground text-4xl font-bold">
                  {card.price === 0 ? "Free" : `$${card.price}`}
                </p>
                <p className="text-muted-foreground text-sm"> One-Time Payment</p>
              </div>

              <div className="flex flex-col py-2 gap-2">
                <p className="text-foreground text-sm">Features</p>
                <div className="w-full h-[1px] bg-border"></div>
              </div>

              <ul className="list-disc list-inside text-muted-foreground text-lg">
                {card.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircleIcon
                      className={`w-4 h-4 ${activeIndex === index ? "text-primary" : "text-muted-foreground"}`}
                    />
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
