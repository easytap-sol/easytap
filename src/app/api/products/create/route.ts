import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role Check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const interestRate = Number(formData.get("interestRate"));
    const durationDays = Number(formData.get("durationDays"));
    const processingFee = Number(formData.get("processingFee")) || 0;
    const penaltyRate = Number(formData.get("penaltyRate")) || 0;
    const description = formData.get("description") as string;

    if (!name || isNaN(interestRate) || isNaN(durationDays)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { error } = await supabase.from('loan_products').insert({
      name,
      interest_rate: interestRate,
      duration_days: durationDays,
      processing_fee: processingFee,
      penalty_rate: penaltyRate,
      description: description,
      is_active: true,
      created_at: new Date().toISOString()
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: "Product created successfully." });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}