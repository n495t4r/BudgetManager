<?php

namespace Tests\Feature;

use App\Models\Bucket;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BucketTest extends TestCase
{
    use RefreshDatabase;

    protected $user, $team;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        $this->team = Team::factory()->create(['owner_id' => $this->user->id]);
        $this->user->update(['team_id' => $this->team->id]);

        $this->get('/login');
    }

    public function test_bucket_can_be_stored_via_route()
    {
        $payload = [
            '_token'   => session()->token(),
            'title'      => 'New Bucket',
            'percentage' => 50,
        ];

        $response = $this->post(route('buckets.store'), $payload);
        $response->assertStatus(302);

        $this->assertDatabaseHas('buckets', [
            'title' => 'New Bucket',
            'team_id'    => $this->user->team_id,
        ]);
    }

    public function test_bucket_can_be_updated_via_route()
    {
        $bucket = Bucket::factory()->for($this->team)->create();
        $payload = [
            '_token' => session()->token(),
            'title' => 'Updated Bucket Title'];

        $response = $this->patch(route('buckets.update', $bucket), $payload);
        $response->assertStatus(302);

        $bucket->refresh();
        $this->assertEquals('Updated Bucket Title', $bucket->title);
    }


    // Test bucket can be deleted by someone

    public function test_bucket_can_be_deleted_via_route()
    {
        $bucket = Bucket::factory()->for($this->team)->create();
        $response = $this->delete(route('buckets.destroy', $bucket),
        [
            '_token' => session()->token(),
        ]);
        $response->assertStatus(302);

        $this->assertDatabaseMissing('buckets', ['id' => $bucket->id]);
    }
}
