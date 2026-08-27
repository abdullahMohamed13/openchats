"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import SectionHeader from "@/components/shared/SectionHeader"
import { motion } from "framer-motion"
import { DURATION_MID, DURATION_FAST } from "@/lib/motion"
import { FAQS } from "@/data/faqs"

export default function FAQSection() {
  return (
		<section className="section-padding w-full gap-8">
      
      <SectionHeader label="FAQ" title="Frequently Asked Questions" />
      
      <Accordion className="w-full" type="single" collapsible>
          {FAQS.map((faq) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: DURATION_MID, ease: "easeInOut", delay: DURATION_FAST }}
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
