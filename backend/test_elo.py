#!/usr/bin/env python3
"""
Simple test script to verify ELO rating algorithm
"""

from music_ratings.services import EloRatingService

def test_elo_algorithm():
    print("Testing ELO Rating Algorithm")
    print("=" * 40)
    
    # Test case 1: Equal ratings
    rating1 = 1500.0
    rating2 = 1500.0
    
    print(f"Initial ratings: {rating1} vs {rating2}")
    new_rating1, new_rating2 = EloRatingService.update_ratings(rating1, rating2)
    print(f"After rating1 wins: {new_rating1:.1f} vs {new_rating2:.1f}")
    print(f"Rating change: +{new_rating1 - rating1:.1f} / {new_rating2 - rating2:.1f}")
    print()
    
    # Test case 2: Higher rated player wins (expected)
    rating1 = 1600.0
    rating2 = 1400.0
    
    print(f"Initial ratings: {rating1} vs {rating2}")
    new_rating1, new_rating2 = EloRatingService.update_ratings(rating1, rating2)
    print(f"After rating1 wins: {new_rating1:.1f} vs {new_rating2:.1f}")
    print(f"Rating change: +{new_rating1 - rating1:.1f} / {new_rating2 - rating2:.1f}")
    print()
    
    # Test case 3: Lower rated player wins (upset)
    rating1 = 1400.0
    rating2 = 1600.0
    
    print(f"Initial ratings: {rating1} vs {rating2}")
    new_rating1, new_rating2 = EloRatingService.update_ratings(rating1, rating2)
    print(f"After rating1 wins: {new_rating1:.1f} vs {new_rating2:.1f}")
    print(f"Rating change: +{new_rating1 - rating1:.1f} / {new_rating2 - rating2:.1f}")
    print()
    
    print("ELO algorithm test completed!")

if __name__ == "__main__":
    test_elo_algorithm() 