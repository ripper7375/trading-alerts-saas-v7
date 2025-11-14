"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">Home &gt; Pricing</nav>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">Start free, upgrade when you need more</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 rounded-full border bg-card p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                !isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all ${
                isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <Badge className="bg-green-500 text-white hover:bg-green-600">Save 17%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mb-16 grid max-w-5xl gap-8 md:grid-cols-2">
          {/* FREE TIER */}
          <Card className="relative flex flex-col">
            <CardHeader>
              <Badge className="mb-4 w-fit bg-green-500 text-white hover:bg-green-600">FREE TIER 🆓</Badge>
              <CardTitle className="flex items-baseline gap-2">
                <span className="text-6xl font-bold">$0</span>
                <span className="text-xl text-muted-foreground">/month</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div>
                    <div className="font-medium">5 Symbols</div>
                    <div className="text-sm text-muted-foreground">BTCUSD, EURUSD, USDJPY, US30, XAUUSD</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div>
                    <div className="font-medium">3 Timeframes</div>
                    <div className="text-sm text-muted-foreground">H1, H4, D1 only</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div className="font-medium">5 Active Alerts</div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div className="font-medium">5 Watchlist Items</div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div className="font-medium">60 API Requests/hour</div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div className="font-medium">Email & Push Notifications</div>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full bg-green-600 py-6 text-lg hover:bg-green-700">Start Free</Button>
              <p className="text-center text-sm text-muted-foreground">No credit card required</p>
            </CardFooter>
          </Card>

          {/* PRO TIER */}
          <Card className="relative flex flex-col border-4 border-blue-600">
            {/* Most Popular Ribbon */}
            <div className="absolute right-0 top-0 rounded-bl-lg bg-blue-600 px-4 py-1 text-sm font-medium text-white">
              ⭐ MOST POPULAR
            </div>
            <CardHeader className="pt-12">
              <Badge className="mb-4 w-fit bg-blue-600 text-white hover:bg-blue-700">PRO TIER ⭐</Badge>
              <CardTitle className="flex items-baseline gap-2">
                <span className="text-6xl font-bold">${isYearly ? "290" : "29"}</span>
                <span className="text-xl text-muted-foreground">/{isYearly ? "year" : "month"}</span>
              </CardTitle>
              {isYearly && <p className="text-sm font-medium text-green-600">Save $58 per year!</p>}
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div>
                    <div className="font-medium">15 Symbols</div>
                    <div className="text-sm text-muted-foreground">All major pairs + crypto + indices</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div>
                    <div className="font-medium">9 Timeframes</div>
                    <div className="text-sm text-muted-foreground">M5, M15, M30, H1, H2, H4, H8, H12, D1</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div className="font-medium">20 Active Alerts</div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div className="font-medium">50 Watchlist Items</div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div className="font-medium">300 API Requests/hour</div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div className="font-medium">All notification types (Email, Push, SMS)</div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div className="font-medium">Priority chart updates (30s)</div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Advanced analytics</span>
                    <Badge variant="secondary" className="text-xs">
                      SOON
                    </Badge>
                  </div>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full animate-pulse bg-blue-600 py-6 text-lg hover:bg-blue-700">
                Start 7-Day Trial
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                7-day free trial, then ${isYearly ? "290/year" : "29/month"}
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Detailed Comparison Table */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold">Detailed Feature Comparison</h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Feature</TableHead>
                  <TableHead className="text-center">FREE</TableHead>
                  <TableHead className="text-center">PRO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-blue-50">
                  <TableCell className="font-medium">Symbols</TableCell>
                  <TableCell className="text-center">5</TableCell>
                  <TableCell className="text-center">15</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 hover:bg-blue-50">
                  <TableCell className="font-medium">Timeframes</TableCell>
                  <TableCell className="text-center">3 (H1, H4, D1)</TableCell>
                  <TableCell className="text-center">9 (M5-D1)</TableCell>
                </TableRow>
                <TableRow className="hover:bg-blue-50">
                  <TableCell className="font-medium">Active Alerts</TableCell>
                  <TableCell className="text-center">5</TableCell>
                  <TableCell className="text-center">20</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 hover:bg-blue-50">
                  <TableCell className="font-medium">Watchlist Items</TableCell>
                  <TableCell className="text-center">5</TableCell>
                  <TableCell className="text-center">50</TableCell>
                </TableRow>
                <TableRow className="hover:bg-blue-50">
                  <TableCell className="font-medium">API Requests/hour</TableCell>
                  <TableCell className="text-center">60</TableCell>
                  <TableCell className="text-center">300</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 hover:bg-blue-50">
                  <TableCell className="font-medium">Chart Updates</TableCell>
                  <TableCell className="text-center">60 seconds</TableCell>
                  <TableCell className="text-center">30 seconds</TableCell>
                </TableRow>
                <TableRow className="hover:bg-blue-50">
                  <TableCell className="font-medium">Email Notifications</TableCell>
                  <TableCell className="text-center">
                    <Check className="mx-auto h-5 w-5 text-green-500" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="mx-auto h-5 w-5 text-green-500" />
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 hover:bg-blue-50">
                  <TableCell className="font-medium">Push Notifications</TableCell>
                  <TableCell className="text-center">
                    <Check className="mx-auto h-5 w-5 text-green-500" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="mx-auto h-5 w-5 text-green-500" />
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-blue-50">
                  <TableCell className="font-medium">SMS Notifications</TableCell>
                  <TableCell className="text-center">
                    <X className="mx-auto h-5 w-5 text-red-500" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="mx-auto h-5 w-5 text-green-500" />
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 hover:bg-blue-50">
                  <TableCell className="font-medium">Priority Support</TableCell>
                  <TableCell className="text-center">
                    <X className="mx-auto h-5 w-5 text-red-500" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="mx-auto h-5 w-5 text-green-500" />
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-blue-50">
                  <TableCell className="font-medium">Advanced Analytics</TableCell>
                  <TableCell className="text-center">
                    <X className="mx-auto h-5 w-5 text-red-500" />
                  </TableCell>
                  <TableCell className="text-center">Coming Soon</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Can I switch plans at any time?</AccordionTrigger>
              <AccordionContent>
                Yes! You can upgrade from Free to Pro at any time. If you're on the Pro plan, you can downgrade at the
                end of your billing period. We'll prorate any charges when upgrading mid-cycle.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What happens after the 7-day trial?</AccordionTrigger>
              <AccordionContent>
                After your 7-day Pro trial ends, you'll be automatically charged ${isYearly ? "$290/year" : "$29/month"}
                unless you cancel before the trial period expires. You can cancel anytime during the trial with no
                charges.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
              <AccordionContent>
                Yes, we offer a 30-day money-back guarantee for all Pro subscriptions. If you're not satisfied with the
                service, contact our support team within 30 days of your purchase for a full refund.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I add more symbols or alerts?</AccordionTrigger>
              <AccordionContent>
                Currently, our plans have fixed limits. However, we're working on custom enterprise plans for users who
                need more symbols, alerts, or API requests. Contact our sales team to discuss your specific needs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Final CTA */}
        <div className="rounded-xl bg-blue-50 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
          <p className="mb-8 text-xl text-muted-foreground">Join thousands of traders using our platform</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Start Free
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
