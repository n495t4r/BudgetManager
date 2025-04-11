<?php

namespace Tests\Feature;

use App\Models\IncomeSource;
use App\Models\Team;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class IncomeSourceTest extends TestCase
{
    use RefreshDatabase;

    protected $user, $team;

    protected function setUp(): void
    {
        parent::setUp();
        // Create a team
        $this->team = Team::factory()->create();

        // Create and assign a user to the team
        $this->user = User::factory()->create([
            'team_id' => $this->team->id, // Assign the team
        ]);
        $this->actingAs($this->user);
        $this->team->update(['owner_id' => $this->user->id]);

        $this->get('/login');
    }

    public function test_income_source_can_be_stored_via_route()
    {
        $payload = [
            '_token'   => session()->token(),
            'name'       => 'Salary',
            'month_year' => '2025-04-01',
            'amount'     => 5000,
            'is_active'  => true,
        ];

        $response = $this->post(route('income-sources.store'), $payload);

        if ($response->status() === 422) { // Validation failed
            dd($response->json()); // Dump validation errors
        }

        $response->assertStatus(302);

        $this->assertDatabaseHas('income_sources', [
            'name' => 'Salary',
            'amount' => 5000,
            'is_active' => true,
            'month_year' => '2025-04-01 00:00:00',
            'team_id' => $this->user->team_id,
            'user_id' => $this->user->id,
        ]);
    }

    public function test_income_source_can_be_updated_via_route()
    {
        $incomeSource = IncomeSource::factory()->for($this->team)->create();
        $payload = ['name' => 'Updated Salary',
        'amount' => 6000, ];

        $response = $this->patch(route('income-sources.update', $incomeSource), [
            '_token' => session()->token(),
            ...$payload]);


        if ($response->status()) { // Validation failed
            // dd($response->json()); // Dump validation errors
        }

        $response->assertStatus(302);

        $incomeSource->refresh();
        $this->assertEquals('Updated Salary', $incomeSource->name);
    }

    // test income source can be updated by someone outside the team, where controller returns return back()->with('error',
    public function test_income_source_cannot_be_updated_by_someone_outside_the_team()
    {
        $otherUser = User::factory()->create();
        $this->actingAs($otherUser);

        $incomeSource = IncomeSource::factory()->for($this->team)->create();
        $payload = ['name' => 'Updated Salary',
        'amount' => 6000, ];

        $response = $this->patch(route('income-sources.update', $incomeSource), [
            '_token' => session()->token(),
            ...$payload]);

        $response->assertStatus(302);
        $response->assertSessionHas('error');
    }

    public function test_income_source_can_be_deleted_via_route()
    {
        $incomeSource = IncomeSource::factory()->for($this->team)->create();
        $response = $this->delete(route('income-sources.destroy', $incomeSource),
        ['_token' => session()->token()]
    );
        $response->assertStatus(302);
        $this->assertDatabaseMissing('income_sources', ['id' => $incomeSource->id]);
    }

   // test income source cannot be deleted by someone outside the team, where controller returns return back()->with('error',
    public function test_income_source_cannot_be_deleted_by_someone_outside_the_team()
    {
        $otherUser = User::factory()->create();
        $this->actingAs($otherUser);

        $incomeSource = IncomeSource::factory()->for($this->team)->create();
        $response = $this->delete(route('income-sources.destroy', $incomeSource),
        ['_token' => session()->token()]
    );
        $response->assertStatus(302);
        $response->assertSessionHas('error', 'You are not allowed to delete this income source');
    }
}
