<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $contacts = Contact::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->orderBy('updated_at', 'desc')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('master/contact/index', [
            'contacts' => $contacts,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return inertia('master/contact/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'image', 'max:1024'],
            'is_customer' => ['boolean'],
            'is_vendor' => ['boolean'],
            'is_employee' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $contact = new Contact($validated);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $contact->avatar = '/storage/' . $path;
        }

        $contact->save();

        return redirect()->route('contact-data.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $contact = Contact::findOrFail($id);

        return inertia('master/contact/edit', [
            'contact' => $contact,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $contact = Contact::findOrFail($id);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'image', 'max:1024'],
            'is_customer' => ['boolean'],
            'is_vendor' => ['boolean'],
            'is_employee' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $contact->fill($validated);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $contact->avatar = '/storage/' . $path;
        }

        $contact->save();

        return redirect()->route('contact-data.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $contact = Contact::findOrFail($id);

        $contact->delete();

        return redirect()->route('contact-data.index');
    }
}
