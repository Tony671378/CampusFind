import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, text, itemType } = body;

    if (action === 'enhance_description') {
      // Smart Description Assistant
      const input = (text || '').trim();
      if (!input) {
        return NextResponse.json({ suggestion: '' });
      }

      const lower = input.toLowerCase();
      let suggestion = '';

      if (lower.includes('bag') || lower.includes('backpack')) {
        suggestion = `${input.charAt(0).toUpperCase() + input.slice(1)} featuring durable zipper compartments, padded shoulder straps, and a side mesh pocket for water bottles. Contains academic notebooks inside.`;
      } else if (lower.includes('wallet') || lower.includes('purse')) {
        suggestion = `${input.charAt(0).toUpperCase() + input.slice(1)} with bi-fold compartments, stitching along edges, and multiple card slots.`;
      } else if (lower.includes('calculator')) {
        suggestion = `${input.charAt(0).toUpperCase() + input.slice(1)} with dual-power solar display, sliding hard protection case, and engraved keyboard matrix.`;
      } else if (lower.includes('bottle') || lower.includes('flask')) {
        suggestion = `${input.charAt(0).toUpperCase() + input.slice(1)} insulated stainless-steel flask with leak-proof screw lid and powder-coated textured finish.`;
      } else if (lower.includes('earbud') || lower.includes('airpod') || lower.includes('headphone')) {
        suggestion = `${input.charAt(0).toUpperCase() + input.slice(1)} true wireless earbuds inside charging case with magnetic snap lid and LED indicator light.`;
      } else if (lower.includes('key')) {
        suggestion = `${input.charAt(0).toUpperCase() + input.slice(1)} attached to a metallic ring with decorative lanyard keychain.`;
      } else if (lower.includes('id') || lower.includes('card')) {
        suggestion = `Official college smart student identification badge with printed photograph, barcode, and university department lanyard.`;
      } else {
        suggestion = `${input.charAt(0).toUpperCase() + input.slice(1)} in good condition with visible distinguishing markings. Used for daily campus lectures.`;
      }

      return NextResponse.json({
        original: input,
        suggestion,
      });
    }

    if (action === 'parse_search') {
      // Natural Language Search Parser
      const query = (text || '').toLowerCase();
      const db = getDb();
      const locations = db.prepare('SELECT id, name FROM locations').all() as { id: number; name: string }[];
      const categories = db.prepare('SELECT id, name FROM categories').all() as { id: number; name: string }[];

      let detectedLocationId: number | null = null;
      for (const loc of locations) {
        const words = loc.name.toLowerCase().split(/\s+/);
        if (words.some(w => w.length > 3 && query.includes(w))) {
          detectedLocationId = loc.id;
          break;
        }
      }

      let detectedCategoryId: number | null = null;
      for (const cat of categories) {
        const words = cat.name.toLowerCase().split(/\s+/);
        if (words.some(w => w.length > 3 && query.includes(w))) {
          detectedCategoryId = cat.id;
          break;
        }
      }

      const colors = ['black', 'blue', 'white', 'red', 'silver', 'grey', 'gray', 'brown', 'green', 'yellow', 'purple', 'gold'];
      const detectedColor = colors.find(c => query.includes(c)) || null;

      let detectedType: 'lost' | 'found' | null = null;
      if (query.includes('lost') || query.includes('misplaced') || query.includes('dropped') || query.includes('forgot')) {
        detectedType = 'lost';
      } else if (query.includes('found') || query.includes('picked up') || query.includes('recovered')) {
        detectedType = 'found';
      }

      // Clean search keyword by removing boilerplate words
      let cleanKeyword = query
        .replace(/i lost my|i found|lost|found|yesterday|today|near|around|at the|please help/gi, '')
        .trim();

      return NextResponse.json({
        type: detectedType,
        location_id: detectedLocationId,
        category_id: detectedCategoryId,
        color: detectedColor,
        keyword: cleanKeyword,
      });
    }

    return NextResponse.json({ error: 'Unknown AI assist action' }, { status: 400 });
  } catch (error) {
    console.error('AI assist error:', error);
    return NextResponse.json({ error: 'AI assist failed' }, { status: 500 });
  }
}
