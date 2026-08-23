"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Line } from "@/components/shared/Line"

const faqs = [
  {
    question: "What is OpenChats?",
    answer:
      "OpenChats is a team communication platform that brings your workspaces, channels, and direct messages together in one place.",
  },
  {
    question: "How many team members can I invite?",
    answer:
      "There's no limit. Invite your whole team — whether it's 5 people or 500.",
  },
  {
    question: "Is OpenChats free?",
    answer:
      "Yes, OpenChats is completely free to use.",
  },
  {
    question: "Can I create multiple workspaces?",
    answer:
      "Absolutely. Organize your team into separate workspaces and channels to keep conversations focused.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We take security seriously and encrypt all communications to keep your team's data safe.",
  },
]

export default function FAQSection() {
  return (
		<section className="section-padding w-full gap-8">
			
      <div className="mb-4 font-bold flex flex-col items-center md:items-start">
        <p className="text-2xl font-quera">FAQ</p>
        <Line className="-mt-4 rotate-179 md:-translate-x-3" width={65} />
        <p className="-mt-2 text-3xl md:text-4xl capitalize text-center md:text-left">Frequently Asked Questions</p>
			</div>
      
      <Accordion className="w-full" type="single" collapsible>
        {faqs.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
