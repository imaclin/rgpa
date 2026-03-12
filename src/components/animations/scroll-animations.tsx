"use client"

import { motion, type Variants } from "framer-motion"
import { type ReactNode } from "react"

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
}

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const scaleUpVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
}

const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 },
}

type AnimationVariant = "fadeUp" | "fadeIn" | "scaleUp" | "slideInLeft" | "slideInRight"

const variantMap: Record<AnimationVariant, Variants> = {
  fadeUp: fadeUpVariants,
  fadeIn: fadeInVariants,
  scaleUp: scaleUpVariants,
  slideInLeft: slideInLeftVariants,
  slideInRight: slideInRightVariants,
}

interface ScrollAnimationProps {
  children: ReactNode
  variant?: AnimationVariant
  delay?: number
  duration?: number
  className?: string
  once?: boolean
}

export function ScrollAnimation({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.6,
  className,
  once = true,
}: ScrollAnimationProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.05 }}
      variants={variantMap[variant]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.05 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
  variant?: AnimationVariant
  duration?: number
}

export function StaggerItem({
  children,
  className,
  variant = "fadeUp",
  duration = 0.5,
}: StaggerItemProps) {
  return (
    <motion.div
      variants={variantMap[variant]}
      transition={{
        duration,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxProps {
  children: ReactNode
  className?: string
  offset?: number
}

export function Parallax({ children, className, offset = 50 }: ParallaxProps) {
  return (
    <motion.div
      initial={{ y: offset }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface CountUpProps {
  value: number
  suffix?: string
  className?: string
}

export function CountUp({ value, suffix = "", className }: CountUpProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {value.toLocaleString()}{suffix}
      </motion.span>
    </motion.span>
  )
}

interface RevealTextProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function RevealText({ children, className, delay = 0 }: RevealTextProps) {
  return (
    <motion.div
      className={className}
      style={{ overflow: "hidden" }}
    >
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 0.7,
          delay,
          ease: [0.25, 0.4, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
