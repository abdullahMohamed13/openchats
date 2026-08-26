"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import SectionHeader from "@/components/shared/SectionHeader"
import { motion } from "framer-motion"

const faqs = [
  {
    question: "What is OpenChats?",
    answer:
      "OpenChats is a communication platform for teams, organizations, clubs, and communities. We bring workspaces, organized channels, and private direct messages together in one place.",
  },
  {
    question: "Who is OpenChats for?",
    answer:
      "Small and medium-sized teams, student organizations, clubs and societies, project groups, and online communities that need organized internal communication.",
  },
  {
    question: "How do workspaces and channels work?",
    answer:
      "A workspace is your group's dedicated space. Inside it, channels organize conversations by topic, project, or purpose, while direct messages handle one-on-one communication.",
  },
  {
    question: "Is there a limit on members?",
    answer:
      "No limit. Share an invite link and bring your whole group on board whether it's 5 people or 500.",
  },
  {
    question: "What can I share in conversations?",
    answer:
      "Text messages, images, files, and voice messages all delivered in real time.",
  },
  {
    question: "Can I belong to multiple workspaces?",
    answer:
      "Yes. Switch between all the groups you belong to from one dashboard and keep every conversation organized.",
  },
  {
    question: "Is OpenChats free?",
    answer: "Yes, OpenChats is completely free to use.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes. OpenChats is fully responsive, so your workspaces and conversations stay usable across desktop and mobile devices.",
  },
]

export default function FAQSection() {
  return (
		<section className="section-padding w-full gap-8">
      
      <SectionHeader label="FAQ" title="Frequently Asked Questions" />
      
      <Accordion className="w-full" type="single" collapsible>
          {faqs.map((faq) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.4, ease: "easeInOut", delay: 0.2 }}
            >
              <AccordionItem value={faq.question}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
    </section>
  )
}
